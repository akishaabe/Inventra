Place your initial SQL files here to auto-initialize the database on FIRST container start only.

How it works
- The official mysql:8.0 image executes any .sql, .sql.gz, and .sh files in /docker-entrypoint-initdb.d when the data directory is empty.
- Our compose mounts this folder there. If the mysql_data volume already has data, these scripts will be ignored.

Recommended file order
- 01_schema.sql  (tables, FKs)
- 02_seed.sql    (reference data)
- 03_inventra_data.sql (your dump e.g., Database/inventra_main.sql or inventra_TimeFM-Ready.sql)

If you already ran MySQL once
- Either import manually (see deploy/README.md) or wipe the mysql_data volume (dangerous: it deletes all data) and start fresh.
