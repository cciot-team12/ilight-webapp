import { Typography, Switch } from "@mui/material";
import dayjs from "dayjs";
import { AlarmConfig } from "../../../lib/types";
import { daysOfWeek } from "../../../lib/constants";

interface AlarmItemProps {
  alarm: AlarmConfig;
  onToggle: (id: string) => void;
  onUpdateIntensity: (id: string, value: number) => void;
  onEdit: () => void;
}

const AlarmItem: React.FC<AlarmItemProps> = ({ alarm, onToggle, onEdit }) => (
  <div
    className="flex items-center justify-between p-4 bg-gray-800 rounded-lg shadow-md mb-4 active:bg-gray-600 hover:bg-gray-700"
    onClick={onEdit}
  >
    <div>
      <Typography variant="h5" className="text-white">
        {dayjs(alarm.time, "HH:mm").format("HH:mm")}
      </Typography>
      <Typography variant="body2" className="text-gray-400">
        {alarm.repeatDays
          .sort((a, b) => {
            return daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b);
          })
          .join(", ")}
      </Typography>
    </div>
    <div
      className="flex items-center"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <Switch
        checked={alarm.isActive}
        onChange={() => {
          onToggle(alarm.id);
        }}
        color="primary"
      />
    </div>
  </div>
);

export default AlarmItem;
