package oracle.dbtools;
/**
 * Demo for running a script in sqlcl with any command.
 */
public class SQLCLIntegrationDemo {
    public static void main(String[] args) {
        SQLclRunner runner = new SQLclRunner();
        String results = runner.runSqlcl("@/Users/bamcgill/sandbox/liquibase/integrate/lbcreatechangelog.sql;", "-name", "cicd-dev", "-s");
        System.out.println(results);
        results = runner.runSqlcl("@/Users/bamcgill/sandbox/liquibase/integrate/lbupdate.sql;", "-name", "cicd-prod", "-s");
        System.out.println(results);
    }
}