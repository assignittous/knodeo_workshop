# 0.1.9

* Wired in recipe support
* Changed folder structure created by `knodeo init`
  * _data --> used for dumping data by ELT processes
  * _src --> used for creating database models and scriptella scripts (jade)
  * _workshop --> used primarily by Knodeo Workshop and infrequently modified by end users
* Wired in `knodeo new --database {databasename}`
* Wired in `knodeo run --migration` -- parameters not tested but should work
* Tweaks to the gulp compilers (no impact to knodeo workshop users)
