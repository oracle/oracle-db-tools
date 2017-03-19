/*
* author:  gvenzl
* created: 19 Mar 2017
*/

package com.oracle;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.math.BigInteger;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Enumeration;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

import javax.crypto.Cipher;

import oracle.security.pki.OracleWallet;
import oracle.security.pki.textui.OraclePKIGenFunc;

public class CloudConnectionManager {

	/**
	 * Gets a new database connnection
	 * @param clientCredentials Path to the client credentials file
	 * @param user Username for database connection
	 * @param password Password for database connection
	 * @param serviceName Service name for database connections
	 * @return A new connection to Exadata Express cloud service
	 * @throws IOException Any IOException while reading the client credentials file
	 * @throws SQLException Any SQLException while opening a connection to the database
	 * @throws NoJCEUnlimitedStrengthSetupException If JCE unlimited strength is not setup correctly
	 * @throws NoSuchAlgorithmException If transformation is not a valid transformation, i.e. in the form of "algorithm" or "algorithm/mode/padding"
	 */
	public static Connection getConnection(String clientCredentials, String user, String password, String serviceName)
			throws IOException, SQLException, NoJCEUnlimitedStrengthSetupException, NoSuchAlgorithmException {
		
		File fClientCredentials = new File(clientCredentials);
		return getConnection(fClientCredentials, user, password, serviceName);
	}
	
	/**
	 * Gets a new database connnection
	 * @param fClientCredentials Client credentials file
	 * @param user Username for database connection
	 * @param password Password for database connection
	 * @param serviceName Service name for database connections
	 * @return A new connection to Exadata Express cloud service
	 * @throws IOException Any IOException while reading the client credentials file
	 * @throws SQLException Any SQLException while opening a connection to the database
	 * @throws NoJCEUnlimitedStrengthSetupException If JCE unlimited strength is not setup correctly
	 * @throws NoSuchAlgorithmException If transformation is not a valid transformation, i.e. in the form of "algorithm" or "algorithm/mode/padding"
	 */
	public static Connection getConnection(File fClientCredentials, String user, String password, String serviceName)
			throws IOException, SQLException, NoJCEUnlimitedStrengthSetupException, NoSuchAlgorithmException {
		
		// Check whether JCE is installed
		checkJCEUnlimitedStrengthSetup();
		
		String pathToTrustStore = createTrustStore(fClientCredentials);

		System.setProperty("oracle.net.tns_admin", pathToTrustStore);

		System.setProperty("oracle.net.ssl_server_dn_match", "true");
		System.setProperty("oracle.net.ssl_version", "1.2");

		// open the CA's wallet
		OracleWallet caWallet = new OracleWallet();
		caWallet.open(pathToTrustStore, null);

		String passwd = generateRandomSecurePassword();
		char[] keyAndTrustStorePasswd = OraclePKIGenFunc.getCreatePassword(passwd, false);

		// certs
		OracleWallet jksK = caWallet.migratePKCS12toJKS(keyAndTrustStorePasswd, OracleWallet.MIGRATE_KEY_ENTIRES_ONLY);

		// migrate (trusted) cert entries from p12 to different jks store
		OracleWallet jksT = caWallet.migratePKCS12toJKS(keyAndTrustStorePasswd,
				OracleWallet.MIGRATE_TRUSTED_ENTRIES_ONLY);
		String trustPath = pathToTrustStore + "/sqlclTrustStore.jks";
		String keyPath = pathToTrustStore + "/sqlclKeyStore.jks";
		jksT.saveAs(trustPath);
		jksK.saveAs(keyPath);

		System.setProperty("javax.net.ssl.trustStore", trustPath);
		System.setProperty("javax.net.ssl.trustStorePassword", passwd.toString());
		System.setProperty("javax.net.ssl.keyStore", keyPath);
		System.setProperty("javax.net.ssl.keyStorePassword", passwd.toString());

		Connection conn = DriverManager.getConnection("jdbc:oracle:thin:@" + serviceName, user, password);
		return conn;
	}
	
	/**
	 * Creates Trust Store.
	 * @param fClientCredentials Client credentials files
	 * @return Path to trust store
	 * @throws IOException
	 */
	private static String createTrustStore(File fClientCredentials) throws IOException {
		Path tmp = Files.createTempDirectory("oracle_cloud_config");
		// clean up on exit
		tmp.toFile().deleteOnExit();

		// Create new temporary zip file
		Path pzip = tmp.resolve("temp.zip");
		Files.copy(new FileInputStream(fClientCredentials), pzip);

		// Extract all files from the zip file
		ZipFile zf = new ZipFile(pzip.toFile());
		Enumeration<? extends ZipEntry> entities = zf.entries();
		while (entities.hasMoreElements()) {
			ZipEntry entry = entities.nextElement();
			String name = entry.getName();
			Path p = tmp.resolve(name);
			Files.copy(zf.getInputStream(entry), p);
		}
		zf.close();
		
		return tmp.toFile().getAbsolutePath();
	}

	/**
	 * Checks whether JCE Unlimited Strength is setup.
	 * @throws NoSuchAlgorithmException If transformation is not a valid transformation, i.e. in the form of "algorithm" or "algorithm/mode/padding"
	 * @throws NoJCEUnlimitedStrengthSetupException If JCE unlimited strength is not setup correctly
	 */
	private static void checkJCEUnlimitedStrengthSetup()
			throws NoSuchAlgorithmException, NoJCEUnlimitedStrengthSetupException
	{
		// Check whether Java Cryptography Extension (JCE) Unlimited Strength Jurisdiction Policy Files 8 are in place
		// This will generate a huge int if installed correctly
		int maxKeySize = Cipher.getMaxAllowedKeyLength("AES");

		// Throw exception if JCE is not in place
		if (maxKeySize <= 128) {
			throw new NoJCEUnlimitedStrengthSetupException();
		}
	}
	
	/**
	 * Generates new random password
	 * @return A new random password
	 */
	private static String generateRandomSecurePassword() {
		return new BigInteger(130, new SecureRandom()).toString(32);
	}
}
