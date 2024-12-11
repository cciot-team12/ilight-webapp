const { createAlarmInDB, readAllAlarmsInDB, updateAlarmInDB, deleteAlarmInDB } = require('./db');  // Adjust import path as needed
const assert = require('assert');


async function runTests() {
    console.log("Starting.....");

    // Test 1: Create an alarm
    let alarmId;
    try {
        // Create alarm
        const newAlarm = await createAlarmInDB('08:00:00', 'daily', false);
        alarmId = newAlarm.id;

        // Assert that the alarm is created and returned
        assert.strictEqual(newAlarm.time, '08:00:00');
        assert.strictEqual(newAlarm.repeat, 'daily');
        assert.strictEqual(newAlarm.disabled, false);
        console.log('Test 1 passed: Alarm created successfully');
    } catch (err) {
        console.error('Test 1 failed:', err);
    }

    // Test 2: Read all alarms
    try {
        const alarms = await readAllAlarmsInDB();
        // console.log('Retrieved alarms:', alarms);
        
        // Assert that the alarms array includes at least 1 alarm
        assert.ok(Array.isArray(alarms), 'Result is not an array');
        assert.ok(alarms.length > 0, 'No alarms returned');
        assert.ok(alarms.some(alarm => alarm.id == alarmId), `No alarm found with id ${alarmId}`);
        console.log('Test 2 passed: Alarms retrieved successfully');
        
    } catch (err) {
        console.error('Test 2 failed:', err);
    }

    // Test 3: Update alarm
    try {
        const updatedAlarm = await updateAlarmInDB(alarmId, '09:00:00', 'weekly', true);
        
        // Assert the alarm was updated
        assert.strictEqual(updatedAlarm.id, alarmId);
        assert.strictEqual(updatedAlarm.time, '09:00:00');
        assert.strictEqual(updatedAlarm.repeat, 'weekly');
        assert.strictEqual(updatedAlarm.disabled, true);
        console.log('Test 3 passed: Alarm updated successfully');
        
    } catch (err) {
        console.error('Test 3 failed:', err);
    }

    // Test 3.5: Update alarm
    try {
        const updatedAlarm = await updateAlarmInDB(alarmId, '10:00:00');
        
        // Assert the alarm was updated
        assert.strictEqual(updatedAlarm.id, alarmId);
        assert.strictEqual(updatedAlarm.time, '10:00:00');
        assert.strictEqual(updatedAlarm.repeat, 'weekly');
        assert.strictEqual(updatedAlarm.disabled, true);
        console.log('Test 3.5 passed: Alarm updated successfully');
        
    } catch (err) {
        console.error('Test 3.5 failed:', err);
    }

    // Test 4: Delete alarm
    try {
        const deletionSuccess = await deleteAlarmInDB(alarmId);

        // Assert that the alarm was deleted
        assert.strictEqual(deletionSuccess, true);
        console.log('Test 4 passed: Alarm deleted successfully');
        
    } catch (err) {
        console.error('Test 4 failed:', err);
    }

    // Test 5: Attempt to update without any parameters
    try {
        await updateAlarmInDB(alarmId);
        console.error('Test 5 failed: Expected error when no parameters provided');
    } catch (err) {
        assert.strictEqual(err.message, 'At least one parameter must be provided for update.');
        console.log('Test 5 passed: Error thrown as expected');
    }

    // Teardown: Clean up any data created (deleting the alarm we created)
    try {
        await deleteAlarmInDB(alarmId);
        console.log('Teardown completed: Alarm cleaned up');
    } catch (err) {
        console.error('Teardown failed:', err);
    }
}

// Run the tests
runTests().then(() => {
    console.log('All tests completed');
}).catch((err) => {
    console.error('Error during tests:', err);
});