package db.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class V1__preflight_fcl_container_catalogue extends BaseJavaMigration {

    private static final Logger LOG = LoggerFactory.getLogger(V1__preflight_fcl_container_catalogue.class);

    @Override
    public void migrate(Context context) throws Exception {
        ContainerCatalogueMigrationSupport.preflight(context.getConnection(), LOG);
    }
}