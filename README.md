# spring-protobuf   

[![Build Status](https://travis-ci.org/andrey42/spring-protobuf.svg?branch=master)](https://travis-ci.org/andrey42/spring-protobuf)

This is a fully working self-contained example demoing usage of Google profobuf protocol in browser for Spring-based REST services 

## How to run
Clone or download this repo to your folder, then run gradlew from commandline and open browser at http://localhost:8181/spring-protobuf
The html form will have fully editable grid, with updates working both via traditional JSON and Protobuf protocols

To explore more, you can open dev console in the browser to see the diffirences in JSON and protobuf protocols on how data in being transferred in both directions.
Console output from Jetty might come handy too, to see what controllers are mapped and how they're being called.

Default Gradle script will do clean, then build, then execute integration test to validate REST controller via Protobuf to JSON conversion prior to running the container,
if you just want to run the container without executing in prior cleanup, build and integration scripts, execute `appRun` target instead 