import React, { useEffect, useState } from "react";
import { Button, Fab, Typography } from "@mui/material";
import { AlarmConfig } from "../../lib/types";
import AlarmItem from "./components/AlarmItem";
import AlarmForm from "../alarm-form/AlarmFormScreen";
import { BiPlus } from "react-icons/bi";
import brightnessApi from "../../lib/api/brightnessApi";
import alarmApi from "../../lib/api/alarmApi";
import { CgSpinner } from "react-icons/cg";

const initialAlarms: AlarmConfig[] = [];

const HomeScreen: React.FC = () => {
  const [alarms, setAlarms] = useState<AlarmConfig[]>(initialAlarms);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingAlarm, setEditingAlarm] = useState<AlarmConfig | null>(null);
  const [currentBrightness, setCurrentBrightness] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchAlarms = async () => {
    setLoading(true);
    try {
      const response = await alarmApi.get();
      const alarms: {
        id: string;
        time: string;
        repeat: string;
        disabled: boolean;
      }[] = response.data.alarms;
      console.log(response.data);
      setAlarms(
        alarms.map((alarm) => ({
          id: alarm.id,
          userId: "user1",
          time: alarm.time,
          repeatDays: alarm.repeat.split(","),
          lightIntensity: 100,
          isActive: !alarm.disabled,
          createdAt: new Date(),
        }))
      );
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAlarms();
  }, []);

  const openNewAlarmForm = () => {
    setEditingAlarm(null);
    setIsFormOpen(true);
  };

  const openEditAlarmForm = (alarm: AlarmConfig) => {
    setEditingAlarm(alarm);
    setIsFormOpen(true);
  };

  const handleSaveAlarm = (alarm: AlarmConfig) => {
    setAlarms((prevAlarms) => {
      const existingIndex = prevAlarms.findIndex((a) => a.id === alarm.id);
      if (existingIndex !== -1) {
        // Update existing alarm
        const updatedAlarms = [...prevAlarms];
        updatedAlarms[existingIndex] = alarm;
        return updatedAlarms;
      } else {
        // Add new alarm
        return [...prevAlarms, alarm];
      }
    });
    alarmApi.set(alarm.time.substring(0, 5), alarm.repeatDays);
    setIsFormOpen(false);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
  };

  const toggleAlarm = (id: string) => {
    if (alarms.find((alarm) => alarm.id === id)?.isActive) {
      alarmApi.turnOff(id);
    } else {
      alarmApi.turnOn(id);
    }
    setAlarms((prevAlarms) =>
      prevAlarms.map((alarm) =>
        alarm.id === id ? { ...alarm, isActive: !alarm.isActive } : alarm
      )
    );
  };

  const updateLightIntensity = (id: string, value: number) => {
    setAlarms((prevAlarms) =>
      prevAlarms.map((alarm) =>
        alarm.id === id ? { ...alarm, lightIntensity: value } : alarm
      )
    );
  };

  const handleTurnOn = async () => {
    try {
      const response = await brightnessApi.turnOn();
      console.log(response.data);
      setCurrentBrightness(currentBrightness + 10);
    } catch (error) {
      console.error(error);
    }
  };

  const handleTurnOff = async () => {
    try {
      const response = await brightnessApi.turnOff();
      console.log(response.data);
      setCurrentBrightness(currentBrightness - 10);
    } catch (error) {
      console.error(error);
    }
  };

  // called to simulate alarm triggering, starts sunrise simulation on backend
  const handleTriggerAlarm = async () => {
    try {
      const response = await alarmApi.triggerAlarm();
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {isFormOpen ? (
        <AlarmForm
          initialAlarm={editingAlarm === null ? undefined : editingAlarm}
          onSave={handleSaveAlarm}
          onCancel={handleCancel}
        />
      ) : (
        <>
          <div className="w-full h-screen p-6 bg-gray-900 text-white space-y-6">
            <Typography variant="h4" className="mb-6">
              Brightness
            </Typography>
            {/* <Typography variant="body1" className="mb-6">
              Current brightness: {currentBrightness}
            </Typography> */}
            <div className="flex flex-row w-full space-x-6">
              <Button
                variant="contained"
                className="w-full"
                color="primary"
                onClick={handleTurnOff}
              >
                Turn off
              </Button>
              <Button
                variant="contained"
                color="secondary"
                className="w-full"
                onClick={handleTurnOn}
              >
                Turn on
              </Button>
            </div>
            <Button
              variant="contained"
              color="secondary"
              className="w-full"
              onClick={handleTriggerAlarm}
            >
              Simulate an alarm triggering
            </Button>
            <Typography variant="h4" className="mb-6">
              Alarms
            </Typography>
            <div>
              {loading ? (
                <>
                  <CgSpinner />
                </>
              ) : (
                alarms.map((alarm) => (
                  <AlarmItem
                    key={alarm.id}
                    alarm={alarm}
                    onToggle={toggleAlarm}
                    onUpdateIntensity={updateLightIntensity}
                    onEdit={() => openEditAlarmForm(alarm)}
                  />
                ))
              )}
            </div>
            <div className="fixed bottom-2 left-1/2">
              <Fab
                color="primary"
                aria-label="add"
                className="fixed bottom-6 right-6 "
                onClick={openNewAlarmForm}
              >
                <BiPlus />
              </Fab>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default HomeScreen;
