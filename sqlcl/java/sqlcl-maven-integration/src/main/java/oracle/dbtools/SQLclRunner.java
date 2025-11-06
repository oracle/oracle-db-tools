package oracle.dbtools;
import liquibase.Scope;
import oracle.dbtools.commands.OCIConnectorTypeFactory;
import oracle.dbtools.raptor.console.ConsoleService;
import oracle.dbtools.raptor.newscriptrunner.ScriptRunnerContext;
import oracle.dbtools.raptor.newscriptrunner.ScriptRunnerContextFactory;
import oracle.dbtools.raptor.newscriptrunner.commands.connect.ConnectionContextFactory;
import oracle.dbtools.raptor.newscriptrunner.commands.connect.ConnectorTypeCacheFactory;
import oracle.dbtools.raptor.newscriptrunner.commands.connector.*;
import oracle.dbtools.raptor.newscriptrunner.util.container.ProviderFactory;
import oracle.dbtools.raptor.newscriptrunner.util.provider.EnvironmentFactory;
import oracle.dbtools.raptor.scriptrunner.cmdline.SqlCli;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * This is a simple runner for SQLcl.  We have it at this level because all commands
 * are available from here including liquibase, mle, and mdb.
 *
 * @author bamcgill
 * @author skutz
 */
public class SQLclRunner {
    PrintStream newPs;
    String result;
    private final ByteArrayOutputStream newOut;
    private final PrintStream oldOut , oldErr;

    public SQLclRunner() {
        oldOut = System.out;
        oldErr = System.err;
        newOut = new ByteArrayOutputStream();
        newPs = new PrintStream(newOut);
    }

    public String runSqlcl(final String input, final String... args) {
        System.setProperty("force.interactive", "true");
        System.setProperty("no.login.sql", "true");
        System.setProperty("user.dir", System.getProperty("java.io.tmpdir"));
        // this disables the highlighter. needs better way to kill banner and highlighter
        System.setProperty("dev.flag", "true");
        final InputStream inputStream = new ByteArrayInputStream((input + "\nquit\n").getBytes(StandardCharsets.UTF_8));
        final PrintStream cmdStream = new PrintStream(new OutputStream() {
            @Override
            public void write(final int b) {
            }
        });
        try {
            final ScriptRunnerContext context = getContext(newPs);
            Scope.setScopeManager(null);
            SqlCli cli = new SqlCli(context, ConsoleService.builder().streams(inputStream, cmdStream), args);
            System.setOut(newPs);
            System.setErr(newPs);
            cli.runSqlcl();
            System.setOut(oldOut);
            System.setErr(oldErr);
            newPs.flush();
            result = newOut.toString();
            newOut.reset();
            cli.close();
            return result;
        } catch (final Exception e) {
           System.out.println(e.getMessage());
        } finally {
            newOut.reset();
            result = "";
        }
        return result;
    }

    private ScriptRunnerContext getContext( PrintStream cmdStream) throws Exception {
        try {
            List<ProviderFactory<?>> contextFactories = new ArrayList<>(List.of(new ScriptRunnerContextFactory(), //
                    new EnvironmentFactory(), //
                    new ConnectionContextFactory(), //
                    new ConnectorTypeCacheFactory(), //
                    new OracleConnectorTypeFactory(), //
                    new OracleRestConnectorTypeFactory(), //
                    new CloudWalletConnectorTypeFactory(), //
                    new SocksProxyConnectorTypeFactory(), //
                    new ThirdPartyConnectorTypeFactory(), //
                    new OCIConnectorTypeFactory(), //
                    new NamedConnectionsConnectorTypeFactory()));
            final ScriptRunnerContext context = new ScriptRunnerContext(Collections.unmodifiableList(contextFactories));
            context.setSupressOutput(false);
            context.setOutputStreamWrapper(new BufferedOutputStream(cmdStream));
            return context;
        } catch (final Exception e) {
            throw new Exception(e);
        }
    }
}
