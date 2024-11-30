
export type AlarmConfig = {
    id: string;
    userId: string;
    time: string; // ISO 8601 format
    repeatDays: string[];
    lightIntensity: number; // 0-100
    isActive: boolean;
    createdAt: Date;
    updatedAt?: Date;
};