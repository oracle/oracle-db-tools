
# ORDS Logging in OCI

## OCI Setups Using OCI CLI

**Note: When running these commands, you will need to save off OCID of the following resources:**

    Dynamic Group OCID
    Log Group OCID
    Log OCID

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

oci logging agent-configuration create --compartment-id ocid1.compartment.oc1..aaaaaaaasoku6xtelb2cghtj4htqika77vwnzir422c5yhdd732hndvezx4a --is-enabled TRUE
 --display-name ORDS_Logging_Agent --service-configuration file://serv.json --group-association file://group.json --description ORDS_Logging_Agent


Use the files in the sample JSON section for this command. Substitute your values.
Sample/Test Agent config  log path in OCI

log path: /home/opc/ords/conf/ords/standalone/logs/*.log


ORDS Setups
ORDS access logs

standalone.access.log=/tmp

standalone.access.format=%{client}a %u %t "%r" %s %{CLF}O "%{Referer}i" "%{User-Agent}i" %{Host}i
Java

TESTING - need to format stack into 1 line if possible

handlers=java.util.logging.FileHandler
# Default global logging level.
.level=INFO
#logging level for the foo.bar package
java.util.logging.FileHandler.pattern=/home/opc/ords/conf/ords/standalone/logs/ords-sys.log
java.util.logging.FileHandler.formatter = java.util.logging.SimpleFormatter
java.util.logging.SimpleFormatter.format = %1$tY-%1$tm-%1$td %1$tH:%1$tM:%1$tS %4$-6s %2$s %5$s%6$s%n


Sample JSON files

group.json

agent-config.json




Notes

so better answer is this... make a file call it mylogfile.properties content is

handlers=java.util.logging.FileHandler
# Default global logging level.
.level=INFO
#logging level for the foo.bar package
java.util.logging.FileHandler.pattern=/tmp/ords-%u.log

 Then when starting ords specify it like this
java -Djava.util.logging.config.file=mylogfile.properties

java.util.logging.FileHandler.formatter = java.util.logging.SimpleFormatter








