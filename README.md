## spring-protobuf
Example of simultaneous support of JSON and Google Protobuf protocols over REST services

This is a fully working self-contained example demoing usage of Google profobuf protocol for exchanging date in/out of Spring backed app

# How to run
clone repo to your folder, then run gradlew from commandline The app will download all nesessary artefacts, including Google protobuf compiler
then create WAR and run it inside Jetty via gradle plugin. Entrypoint will be http://localhost:8181/spring-protobuf
Then you can open dev console in the browser to see the diffirences in JSON and protobuf protocols on how data in being transferred in both directions,
Additionally, observe console output from Jetty to see what controllers are mapped and how they're being called