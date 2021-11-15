
# ORDS Logging in OCI

## Preparing ORDS for Logging

To have ORDS start logging in standalone mode, we need to change a few parameters and create a file to instruct ORDS to log not only java logging, but access logs.

## Update the standalone.properties file

In the directory where the ORDS configuration files are (typically ords/conf/ords/ or if installing from yum, /opt/oracle/ords/conf/ords/), find the standalone directory.

In this directory is the standalone.properties file. Add the following lines but be sure to replace **<LOG_DIRECTORY>** with an actual directory on your VM instance. This walkthrough uses **/home/opc/ords/conf/ords/standalone/logs/** as the logging directory.

```
standalone.access.log=<LOG_DIRECTORY>
standalone.access.format=%{client}a %u %t "%r" %s %{CLF}O "%{Referer}i" "%{User-Agent}i" %{Host}i
```
using /home/opc/ords/conf/ords/standalone/logs/, the standalone.properties file would look like the following:

```
standalone.access.log=/home/opc/ords/conf/ords/standalone/logs/
standalone.access.format=%{client}a %u %t "%r" %s %{CLF}O "%{Referer}i" "%{User-Agent}i" %{Host}i
```

## Create the mylogfile.properties file

Where the ords.war file is located, create a file called mylogfile.properties. Add the following to that file, again replacing **<LOG_DIRECTORY>** with the directory you want to use and used in the previous set up step:

```
handlers=java.util.logging.FileHandler
# Default global logging level for ORDS
.level=INFO
java.util.logging.FileHandler.pattern=<LOG_DIRECTORY>/ords-sys.log
java.util.logging.FileHandler.formatter = java.util.logging.SimpleFormatter
java.util.logging.SimpleFormatter.format = %1$tY-%1$tm-%1$td %1$tH:%1$tM:%1$tS %4$-6s %2$s %5$s%6$s%n
```
using /home/opc/ords/conf/ords/standalone/logs/, the standalone.properties file would look like the following:

```
handlers=java.util.logging.FileHandler
# Default global logging level for ORDS
.level=INFO
java.util.logging.FileHandler.pattern=/home/opc/ords/conf/ords/standalone/logs/ords-sys.log
java.util.logging.FileHandler.formatter = java.util.logging.SimpleFormatter
java.util.logging.SimpleFormatter.format = %1$tY-%1$tm-%1$td %1$tH:%1$tM:%1$tS %4$-6s %2$s %5$s%6$s%n
```

Now, when starting up ords in standalone mode, you will add the following:
```
-Djava.util.logging.config.file=mylogfile.properties
```
with the full command looking like the following
```
java -Djava.util.logging.config.file=mylogfile.properties -jar ords.war standalone &
```

## OCI Setups Using OCI CLI

**Note: When running these commands, you will need to save off OCID of the following resources:**

    VM Instance OCID:_______________________
    Compartment OCID:_______________________
    Dynamic Group OCID:_______________________
    Log Group OCID:_______________________
    Log OCID:_______________________

## Create Dynamic Group

Use the following OCI CLI command to create a dynamic group. The **instanceid** should be the OCID of the VM instance you want to monitor for logs. Replace **<INSTANCE.ID>** with your VM OCID.
```
oci iam dynamic-group create --description ORDS_DynamicGroup --matching-rule "Any {instance.id = '<INSTANCE.ID>'}" --name ORDS_DynamicGroup
```

with the results being similar to the following:

```
{
"data": {
"compartment-id": "ocid1.tenancy.oc1..aaaaaaaambnyexddfd...",
"defined-tags": {},
"description": "ORDS_DynamicGroup",
"freeform-tags": {},
"id": "ocid1.dynamicgroup.oc1..aaaaaaaafddf...",
"inactive-status": null,
"lifecycle-state": "ACTIVE",
"matching-rule": "Any {instance.id = 'ocid1.instance.oc1.eu-frankfurt-1.anth...'}",
"name": "ORDS_DynamicGroup",
"time-created": "2021-06-17T18:03:45.166000+00:00"
},
"etag": "7c4e50ca466387eabc2eee1001001e233d414ad2589"
}
```

Remember to take note of the **"id"** attribite's value

```
"id": "ocid1.dynamicgroup.oc1..aaaaaaaafddf...",
```

## Create a Log Group

Use the following OCI CLI command to create a Log group. The **--compartment-id** should be the OCID of a compartment you want to use for all the logs. Replace **<COMPARTMENT.ID>** with the Compartment OCID you would like to use.

```
oci logging log-group create --compartment-id <COMPARTMENT.ID> --display-name "ORDS_LogGroup"
```

## List Log Groups

Run the following command to get a list of the log groups you have created so we can find the Log Group OCID. Replace **<COMPARTMENT.ID>** with the Compartment OCID you used in the previous step.

```
oci logging log-group list --compartment-id <COMPARTMENT.ID>
```

with the results being similar to the following:

```
{
   "data": [
     {
      "compartment-id": "ocid1.compartment.oc1..aaaaaaaasoku6xtelb2c...",
      "defined-tags": {},
      "description": null,
      "display-name": "ORDS_LogGroup",
      "freeform-tags": {},
      "id": "ocid1.loggroup.oc1.eu-frankfurt-1.amaaaaaau3i6vkyayig4yxj7un...",
      "lifecycle-state": "ACTIVE",
      "time-created": "2021-06-17T16:34:09.913000+00:00",
      "time-last-modified": "2021-06-17T16:34:09.913000+00:00"
     },
     {
      "compartment-id": "ocid1.compartment.oc1..aaaaaaaasoku6xtelb2...",
      "defined-tags": {},
      "description": null,
      "display-name": "test",
      "freeform-tags": {},
      "id": "ocid1.loggroup.oc1.eu-frankfurt-1.amaaaaaau3i6vkyadrtdi2tzklev...",
      "lifecycle-state": "ACTIVE",
      "time-created": "2021-06-03T21:37:49.893000+00:00",
      "time-last-modified": "2021-06-03T21:37:49.893000+00:00"
     }
   ]
}
```

Remember to take note of the **"id"** attribite's value for the **ORDS_LogGroup** Log Group.
```
"display-name": "ORDS_LogGroup",
"freeform-tags": {},
"id": "ocid1.loggroup.oc1.eu-frankfurt-1.amaaaaaau3i6vkyayig4yxj7un...",
```

## Create a Log

Use the following OCI CLI command to create a Log using the OCID of the Log Group you previously created. Replace **<LOG_GROUP.ID>** with the Log Group OCID you created in the **Create a Log Group** step and found the OCID in the **List Log Groups** step.
```
oci logging log create --display-name ORDS_Logs --log-group-id <LOG_GROUP.ID> --log-type CUSTOM
```

## List the Logs

Use the following OCI CLI command to list all the logs that belong to a log group. It uses the Log Group OCID as a parameter. Replace **<LOG_GROUP.ID>** with the Log Group OCID you created in the **Create a Log Group** step and found the OCID in the **List Log Groups** step.

```
oci logging log list --log-group-id <LOG_GROUP.ID>
```

with the results being similar to the following:

```
{
   "data": [
     {
      "compartment-id": "ocid1.compartment.oc1..aaaaaaaasoku6xtelb2...",
      "configuration": null,
      "defined-tags": {},
      "display-name": "ORDS_Logs",
      "freeform-tags": {},
      "id": "ocid1.log.oc1.eu-frankfurt-1.amaaaaaau3i6vkyaduc...",
      "is-enabled": true,
      "lifecycle-state": "ACTIVE",
      "log-group-id": "ocid1.loggroup.oc1.eu-frankfurt-1.amaaaaaau3i6vkyayig4yxj7unl...",
      "log-type": "CUSTOM",
      "retention-duration": 30,
      "time-created": "2021-06-17T16:42:46.599000+00:00",
      "time-last-modified": "2021-06-17T16:42:46.599000+00:00"
     }
   ]
}
```

Remember to take note of the **"id"** attribite's value for the **ORDS_Logs** Log Group.

```
"display-name": "ORDS_Logs",
"freeform-tags": {},
"id": "ocid1.log.oc1.eu-frankfurt-1.amaaaaaau3i6vkyaduc...",
```

## List the Dynamic Groups

Use the following OCI CLI command to list all the Dynamic Groups. We will be adding the **--name** parameter so that we only get back the dynamic group we created called ORDS_DynamicGroup.

```
oci iam dynamic-group list --name ORDS_DynamicGroup
```
with the results being similar to the following:

```
{
   "data": [
     {
      "compartment-id": "ocid1.tenancy.oc1..aaaaaaaambnyexdta...",
      "defined-tags": {},
      "description": "ORDS_DynamicGroup",
      "freeform-tags": {},
      "id": "ocid1.dynamicgroup.oc1..aaaaaaaajbgg7wq7aawnnkmrocvo...",
      "inactive-status": null,
      "lifecycle-state": "ACTIVE",
      "matching-rule": "Any {instance.id = 'ocid1.instance.oc1.eu-frankfurt-1.antheljsu3i6vkyc...'}",
      "name": "ORDS_DynamicGroup",
      "time-created": "2021-06-17T18:03:45.166000+00:00"
     }
   ]
}
```

Remember to take note of the **"id"** attribite's value.

```
"description": "ORDS_DynamicGroup",
"freeform-tags": {},
"id": "ocid1.dynamicgroup.oc1..aaaaaaaajbgg7wq7aawnnkmrocvo...",
```

## Create an Agent Config to Harvest Logs on the Compute Instance

Use the following OCI CLI command to create an agent to harvest our ORDS log files and place them into the Logging Service. Replace **<COMPARTMENT.ID>** with the Compartment OCID you used previously.

```
oci logging agent-configuration create --compartment-id <COMPARTMENT.ID> --is-enabled TRUE --display-name ORDS_Logging_Agent --service-configuration file://serv.json --group-association file://group.json --description ORDS_Logging_Agent
```

Before running this command, we need to stage and fill two files; serv,json and group.json

### group.json

In the [group.json](./files/group.json) file, you will replace **<DYNAMIC_GROUP.ID>** with the OCID of your dnynamic group you previously created.

```
{
  "groupList": [
    "<DYNAMIC_GROUP.ID>"
  ]
}
```

### serv.json

In the [serv.json](./files/serv.json) file, you will replace **<LOG.ID>** with the OCID of your Log you previously created.

```
  {
    "configurationType": "LOGGING",
    "destination": {
      "logObjectId": "<LOG.ID>"
    },
    "sources": [
        {
            "name": "ordslog2",
            "parser": {
              "field-time-key": null,
              "is-estimate-current-event": null,
              "is-keep-time-key": null,
              "is-null-empty-string": null,
              "message-key": null,
              "null-value-pattern": null,
              "parser-type": "NONE",
              "timeout-in-milliseconds": null,
              "types": null
            },
            "paths": [
              "/home/opc/ords/conf/ords/standalone/logs/*.log"
            ],
            "source-type": "LOG_TAIL"
          }
    ]
  }
```

Shortly after the agent is created, you will begin to see logs from the ORDS VM instance appear in this log. The agent is set to tail the log files in the path: /home/opc/ords/conf/ords/standalone/logs/*.log. Your logging path my differ depending on the ORDS logging set up steps.







