import platform
import sys
import oracledb
import os
from sqlalchemy.engine import create_engine
from oracledb import OperationalError
import pandas as pd
# import psycopg2 as pg

from sqlalchemy.dialects import registry

from snowflake.connector.pandas_tools import write_pandas
from snowflake.connector.pandas_tools import pd_writer

# session = Session(engine)

# https://levelup.gitconnected.com/using-python-oracledb-1-0-with-sqlalchemy-pandas-django-and-flask-5d84e910cb19
# https://medium.com/opex-analytics/database-connections-in-python-extensible-reusable-and-secure-56ebcf9c67fe

oracledb.version = "8.3.0"
sys.modules["cx_Oracle"] = oracledb

if platform.system() == "Darwin":
    # oracledb.init_oracle_client(lib_dir=os.environ.get("HOME")+"/Downloads/instantclient_19_8")
    pass
elif platform.system() == "Windows":
    oracledb.init_oracle_client(
        lib_dir=r"G:\Revenue Integrity\Systems Team\Sudhakar\oracle\instantclient_19_5")
else:
    oracledb.init_oracle_client()

registry.register('snowflake', 'snowflake.sqlalchemy', 'dialect')

account_identifier = 'emirates.west-europe.azure'
user = 'REV_INT_GENERIC'
password = 'fy4uDE2023'
database_name = 'EDWH_PROD'
schema_name = 'WS_RO_REVINT_PR_PROD'
warehouse_name = 'RO_REVINT_PR_WH_PROD'
role_name = 'RO_REVINT_PR_DEVELOPER_PROD'
conn_string = f"snowflake://{user}:{password}@{account_identifier}/{database_name}/{schema_name}?warehouse={warehouse_name}&role={role_name}"

# ctx = create_engine(conn_string)

# conn = pg.connect(
#     host="localhost",
#     database="integrity",
#     user="postgres",
#     password="matrix8639")

# engine = create_engine(
#     "postgresql+psycopg2://scott:tiger@localhost/test",
#     isolation_level="SERIALIZABLE",
# )


class DBConnection:
    TKTODS_USERNAME = 'res_user'
    TKTODS_PASSWORD = 'tktres#777'
    #rep maybe down changing to tktods as suggested by Sanjeev
    # TKTODS_SERVICE = 'tktods_rep'
    TKTODS_SERVICE = 'tktods'

    # PNRL_USERNAME = 'res_user'
    # PNRL_PASSWORD = 'pnrres#777'
    # PNRL_SERVICE = 'pnrl_rep'
    PNRL_USERNAME = 'ym_user'
    PNRL_PASSWORD = 'Ym_u$5r'
    PNRL_SERVICE = 'pnrl_rep'

    PRMS_USERNAME = 'ymusr'
    PRMS_PASSWORD = 'ymusr'
    PRMS_SERVICE = 'prms'
    #test for PRMS issue --to be removed temporary soln from Sanjeev
    host = "DOLIADPV193"
    port = 6516

    CBI_USERNAME = 'cbi_mstr_admin'
    CBI_PASSWORD = 'cbiMSTR#123'
    CBI_SERVICE = 'cbiop'

    RISL_USERNAME = 'ym_cur_user'
    RISL_PASSWORD = 'Ek1234#'
    RISL_SERVICE = 'risl'
    connector = None
    connection = None

    POSTGRES_HOST = "localhost"
    POSTGRES_PORT = '5432'
    POSTGRES_DB = "integrity"
    POSTGRES_USER = "postgres"
    POSTGRES_PASSWORD = "matrix8639"

    OND_USERNAME = 'SVC_EK_RM_PROD_REPORTS_RO'
    OND_PASSWORD = 'Iz7wNOlb'
    OND_SERVICE = 'ekdb10p'

    account_identifier = 'emirates-edw'
    user = 'REV_INT_GENERIC'
    password = 'fy4uDE2023'
    database_name = 'EDWH_PROD'
    schema_name = 'WS_RO_REVINT_PR_PROD'
    warehouse_name = 'RO_REVINT_PR_WH_PROD'
    role_name = 'RO_REVINT_PR_DEVELOPER_PROD'
    conn_string = f"snowflake://{user}:{password}@{account_identifier}/{database_name}/{schema_name}?warehouse={warehouse_name}&role={role_name}"

    def __init__(self, service_name) -> None:
        self.service_name = service_name

    def __enter__(self):
        if self.service_name == 'tktods':
            self.connector = create_engine(
                f'oracle://{self.TKTODS_USERNAME}:{self.TKTODS_PASSWORD}@{self.TKTODS_SERVICE}')
            # self.session = Session(self.connector)
            self.connection = self.connector.connect()
            return self
        elif self.service_name == 'pnrl':
            self.connector = create_engine(
                f'oracle://{self.PNRL_USERNAME}:{self.PNRL_PASSWORD}@{self.PNRL_SERVICE}')
            self.connection = self.connector.connect()
            return self
        elif self.service_name == 'prms':
            self.connector = create_engine(
                f'oracle://{self.PRMS_USERNAME}:{self.PRMS_PASSWORD}@{self.PRMS_SERVICE}')
            self.connection = self.connector.connect()
            return self
        elif self.service_name == 'risl':
            self.connector = create_engine(
                f'oracle://{self.RISL_USERNAME}:{self.RISL_PASSWORD}@{self.RISL_SERVICE}')
            self.connection = self.connector.connect()
            return self
        elif self.service_name == 'cbi':
            self.connector = create_engine(
                f'oracle://{self.CBI_USERNAME}:{self.CBI_PASSWORD}@{self.CBI_SERVICE}')
            self.connection = self.connector.connect()
            return self
        elif self.service_name == 'ond':
            self.connector = create_engine(
                f'oracle://{self.OND_USERNAME}:{self.OND_PASSWORD}@{self.OND_SERVICE}')
            self.connection = self.connector.connect()
            return self
        elif self.service_name == 'snowflake':
            self.connector = create_engine(
                self.conn_string)
            self.connection = self.connector.connect()
            return self
        elif self.service_name == 'postgres':
            self.connector = create_engine(
                f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}/{self.POSTGRES_DB}", isolation_level="SERIALIZABLE",)
            self.connection = self.connector.connect()
            return self
        else:
            return "No Connection."

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.connection.close()
        self.connector.dispose(close=False)

def execute_script(filename, db_connection, parse_dates=None,lowercase_columns=0):
    with open(filename, 'r') as sql:
        query = sql.read()
        try:
            data = pd.read_sql(query, db_connection, parse_dates=parse_dates)
            if lowercase_columns==1:
                data.columns = map(str.upper, data.columns)
                data.columns = map(str.lower, data.columns)
            else:
                data.columns = map(str.upper, data.columns)
            return data
        except OperationalError as msg:
            print(msg)
            return pd.DataFrame()


def execute_query(query, db_connection, parse_dates=None,lowercase_columns=0):
    try:
        data = pd.read_sql(query, db_connection, parse_dates=parse_dates)
        if lowercase_columns==1:
            data.columns = map(str.upper, data.columns)
            data.columns = map(str.lower, data.columns)
        else:
            data.columns = map(str.upper, data.columns)
        return data
    except OperationalError as msg:
        print(msg)
        return pd.DataFrame()


# def __enter__(self):
#     connectors = {
#         'tktods': (self.TKTODS_USERNAME, self.TKTODS_PASSWORD, self.TKTODS_SERVICE),
#         'pnrl': (self.PNRL_USERNAME, self.PNRL_PASSWORD, self.PNRL_SERVICE),
#         'prms': (self.PRMS_USERNAME, self.PRMS_PASSWORD, self.PRMS_SERVICE),
#         'risl': (self.RISL_USERNAME, self.RISL_PASSWORD, self.RISL_SERVICE),
#         'cbi': (self.CBI_USERNAME, self.CBI_PASSWORD, self.CBI_SERVICE),
#         'snowflake': self.conn_string,
#         'postgres': (
#             f"postgresql+psycopg2://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
#             f"@{self.POSTGRES_HOST}/{self.POSTGRES_DB}",
#             {'isolation_level': 'SERIALIZABLE'},
#         ),
#     }
#     conn_args = connectors.get(self.service_name)
#     if conn_args is None:
#         return "No Connection."
#     if isinstance(conn_args, tuple):
#         conn_string = f"oracle://{conn_args[0]}:{conn_args[1]}@{conn_args[2]}"
#         engine = create_engine(conn_string)
#         if self.service_name == 'postgres':
#             engine = engine.execution_options(**conn_args[1])
#     else:
#         engine = create_engine(conn_args)
#     self.connector = engine
#     self.connection = engine.connect()
#     return self

# def __exit__(self, exc_type, exc_val, exc_tb):
#     self.connection.close()
#     self.connector.dispose()


# Explanation:

# The __enter__ method has been refactored to use a dictionary (connectors) to map service names to connection parameters.
# If the service name is not found in the dictionary, the method returns "No Connection.".
# If the connection parameters are a tuple, it means that the service is an Oracle database. In that case, the method creates the connection string and the engine using create_engine, passing the string as an argument. If the service is Postgres, the method also passes the isolation level as an execution option to the engine.
# If the connection parameters are not a tuple, it means that the service is Snowflake. In that case, the method uses the connection string directly to create the engine.
# The __exit__ method has been simplified by removing the code to commit or rollback transactions, as it is not necessary for this specific use case. The method simply closes the connection and disposes the engine.

