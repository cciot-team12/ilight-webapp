# run the following with esp-idf 4.3 CMD
esptool.py --chip esp32 --port COM10 erase_flash
esptool.py --chip esp32 --port COM10 write_flash -z 0x1000 ESP32_GENERIC-SPIRAM-20241025-v1.24.0.bin