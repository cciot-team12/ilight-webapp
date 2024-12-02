import React, { useState } from "react";
import {
  Button,
  Typography,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { TimePicker } from "@mui/x-date-pickers";
import { AlarmConfig } from "../../lib/types";
import { BiChevronLeft, BiSave } from "react-icons/bi";
import { daysOfWeek } from "../../lib/constants";

interface AlarmFormProps {
  initialAlarm?: AlarmConfig;
  onSave: (alarm: AlarmConfig) => void;
  onCancel: () => void;
}

const AlarmForm: React.FC<AlarmFormProps> = ({
  initialAlarm,
  onSave,
  onCancel,
}) => {
  const [time, setTime] = useState<Dayjs | null>(
    initialAlarm ? dayjs(initialAlarm.time, "HH:mm:ss") : null
  );
  const [repeatDays, setRepeatDays] = useState<string[]>(
    initialAlarm ? initialAlarm.repeatDays : []
  );
  // const [lightIntensity, setLightIntensity] = useState<number>(
  //   initialAlarm ? initialAlarm.lightIntensity : 50
  // );
  // const [isActive, setIsActive] = useState<boolean>(
  //   initialAlarm ? initialAlarm.isActive : true
  // );

  const handleRepeatDaysChange = (
    _: React.MouseEvent<HTMLElement>,
    newRepeatDays: string[]
  ) => {
    setRepeatDays(newRepeatDays);
  };

  const handleSave = () => {
    if (!time) {
      alert("Please select a time for the alarm");
      return;
    }
    if (time) {
      const formattedTime = time.format("HH:mm:ss");
      const alarm: AlarmConfig = {
        id: initialAlarm ? initialAlarm.id : Date.now().toString(),
        userId: "user1",
        time: formattedTime,
        repeatDays,
        lightIntensity: 100,
        isActive: true,
        createdAt: initialAlarm ? initialAlarm.createdAt : new Date(),
        updatedAt: new Date(),
      };
      onSave(alarm);
    }
  };

  return (
    <div className="w-full h-screen p-6 bg-gray-900 text-white space-y-6">
      {/* Appbar */}
      <div className="flex w-full justify-between">
        <IconButton onClick={onCancel}>
          <BiChevronLeft />
        </IconButton>
        <Typography
          variant="body1"
          className="mb-6 content-center"
          color="secondary"
        >
          {initialAlarm ? "Edit Alarm" : "New Alarm"}
        </Typography>
        <IconButton onClick={handleSave}>
          <BiSave />
        </IconButton>
      </div>

      {/* Form fields */}
      <div className="space-y-4">
        <TimePicker
          label="Alarm Time"
          className="w-full"
          defaultValue={time}
          value={time}
          onChange={(newValue) => setTime(newValue)}
        />
        {/* Repeat Days */}
        <div>
          <Typography variant="body1">Repeat Days</Typography>
          <ToggleButtonGroup
            value={repeatDays}
            onChange={handleRepeatDaysChange}
            aria-label="repeat days"
            color="primary"
            size="small"
            className="mt-2 w-full"
          >
            {daysOfWeek.map((day) => (
              <ToggleButton
                key={day}
                value={day}
                selected={repeatDays.includes(day)}
                aria-label={day}
                sx={{
                  borderRadius: "50%",
                  width: 40,
                  height: 40,
                }}
              >
                {day.charAt(0)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>
        {/* <div>
          <Typography gutterBottom>
            Light Intensity: {lightIntensity}%
          </Typography>
          <Slider
            value={lightIntensity}
            onChange={(_, value) => setLightIntensity(value as number)}
            min={0}
            max={100}
            step={5}
            valueLabelDisplay="auto"
          />
        </div> */}
        {/* <div className="flex items-center">
          <Typography className="mr-2">Active</Typography>
          <Switch
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            color="primary"
          />
        </div> */}
      </div>
      <div className="fixed bottom-6 flex w-5/6 justify-between space-x-6">
        <Button
          variant="outlined"
          color="secondary"
          className="w-full"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          className="w-full"
          color="primary"
          onClick={handleSave}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default AlarmForm;
