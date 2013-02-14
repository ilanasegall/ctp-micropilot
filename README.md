Restartless addon - just add it to the version of FF you wish to test.

To see logging messages:

1. Go to the "error console page" (should open automatically).
2. Click on the "messages" tab. Anything that starts with "info: ctp_test" is someting
   that will be written to the db in the actual study
3. Check that your channel, data blob, and timestamp are correct


Note: you should see two additional messages in this version, 

```
    "info: ctp_test: Addon is running!"`
    "info: ctp_test: willrecord: {"msg":"final-ui-startup","data":"Passed a message on final-ui-startup!","ts":1360871132613}." These test that the addon is running and that a message can be broadcast and recorded, respectively.
```
