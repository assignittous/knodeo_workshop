# 0.1.10

* After updating, run `knodeo init` to add new folders
* Updated initial changelog recipe to include a `0.0.0` tag to facilitate rollbacks
* Precompile scriptella script when executing `knodeo run --script`
* Precompile etl.properties when executing `knodeo run --script`
* Wired in `knodeo run --script {scriptname}`
* Add `_workshop/temp` folder for placing disposable intermediate files that are made when a knodeo command is executed
* Still missing: Error traps

# 0.1.9

* Wired in recipe support
* Changed folder structure created by `knodeo init`
  * _data --> used for dumping data by ELT processes
  * _src --> used for creating database models and scriptella scripts (jade)
  * _workshop --> used primarily by Knodeo Workshop and infrequently modified by end users
* Wired in `knodeo new --database {databasename}`
* Wired in `knodeo new --migration {migrationname}` -- parameters not tested but should work
* Wired in `knodeo new --script {scriptname}` -- parameters not tested but should work
* Wired in `knodeo run --migration` -- parameters not tested but should work
* Wired in `knodeo run --rollback` -- parameters still outstanding
* Tweaks to the gulp compilers (no impact to knodeo workshop users)
