import React, { useState } from "react";
import { Fab, Typography } from "@mui/material";
import { AlarmConfig } from "../../lib/types";
import AlarmItem from "./components/AlarmItem";
import AlarmForm from "../alarm-form/AlarmFormScreen";
import { BiPlus } from "react-icons/bi";

const initialAlarms: AlarmConfig[] = [
  {
    id: "1",
    userId: "user1",
    time: "07:00:00",
    repeatDays: ["Mon", "Wed", "Fri"],
    lightIntensity: 80,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "2",
    userId: "user1",
    time: "08:00:00",
    repeatDays: ["Tue", "Thu"],
    lightIntensity: 50,
    isActive: true,
    createdAt: new Date(),
  },
  {
    id: "3",
    userId: "user1",
    time: "08:00:00",
    repeatDays: ["Sat", "Sun"],
    lightIntensity: 0,
    isActive: false,
    createdAt: new Date(),
  },
];

const HomeScreen: React.FC = () => {
  const [alarms, setAlarms] = useState<AlarmConfig[]>(initialAlarms);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingAlarm, setEditingAlarm] = useState<AlarmConfig | null>(null);

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
    setIsFormOpen(false);
  };

  const handleCancel = () => {
    setIsFormOpen(false);
  };

  const toggleAlarm = (id: string) => {
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
              Alarms
            </Typography>
            <div>
              {alarms.map((alarm) => (
                <AlarmItem
                  key={alarm.id}
                  alarm={alarm}
                  onToggle={toggleAlarm}
                  onUpdateIntensity={updateLightIntensity}
                  onEdit={() => openEditAlarmForm(alarm)}
                />
              ))}
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
