#include <pgmspace.h>
 
#define SECRET
#define THINGNAME "IlightESP32_2"                         //change this
 
const char WIFI_SSID[] = "OPPO Reno5 5G";               //change this
const char WIFI_PASSWORD[] = "waterproofclock";           //change this
const char AWS_IOT_ENDPOINT[] = "a2egqzjr3o735x-ats.iot.ap-southeast-1.amazonaws.com";       //change this
 
// Amazon Root CA 1
static const char AWS_CERT_CA[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
MIIDQTCCAimgAwIBAgITBmyfz5m/jAo54vB4ikPmljZbyjANBgkqhkiG9w0BAQsF
ADA5MQswCQYDVQQGEwJVUzEPMA0GA1UEChMGQW1hem9uMRkwFwYDVQQDExBBbWF6
b24gUm9vdCBDQSAxMB4XDTE1MDUyNjAwMDAwMFoXDTM4MDExNzAwMDAwMFowOTEL
MAkGA1UEBhMCVVMxDzANBgNVBAoTBkFtYXpvbjEZMBcGA1UEAxMQQW1hem9uIFJv
b3QgQ0EgMTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALJ4gHHKeNXj
ca9HgFB0fW7Y14h29Jlo91ghYPl0hAEvrAIthtOgQ3pOsqTQNroBvo3bSMgHFzZM
9O6II8c+6zf1tRn4SWiw3te5djgdYZ6k/oI2peVKVuRF4fn9tBb6dNqcmzU5L/qw
IFAGbHrQgLKm+a/sRxmPUDgH3KKHOVj4utWp+UhnMJbulHheb4mjUcAwhmahRWa6
VOujw5H5SNz/0egwLX0tdHA114gk957EWW67c4cX8jJGKLhD+rcdqsq08p8kDi1L
93FcXmn/6pUCyziKrlA4b9v7LWIbxcceVOF34GfID5yHI9Y/QCB/IIDEgEw+OyQm
jgSubJrIqg0CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMC
AYYwHQYDVR0OBBYEFIQYzIU07LwMlJQuCFmcx7IQTgoIMA0GCSqGSIb3DQEBCwUA
A4IBAQCY8jdaQZChGsV2USggNiMOruYou6r4lK5IpDB/G/wkjUu0yKGX9rbxenDI
U5PMCCjjmCXPI6T53iHTfIUJrU6adTrCC2qJeHZERxhlbI1Bjjt/msv0tadQ1wUs
N+gDS63pYaACbvXy8MWy7Vu33PqUXHeeE6V/Uq2V8viTO96LXFvKWlJbYK8U90vv
o/ufQJVtMVT8QtPHRh8jrdkPSHCa2XV4cdFyQzR1bldZwgJcJmApzyMZFo6IQ6XU
5MsI+yMRQ+hDKXJioaldXgjUkK642M4UwtBV8ob2xJNDd2ZhwLnoQdeXeGADbkpy
rqXRfboQnoZsG4q5WTP468SQvvG5
-----END CERTIFICATE-----
)EOF";
 
// Device Certificate                                               //change this
static const char AWS_CERT_CRT[] PROGMEM = R"KEY(
-----BEGIN CERTIFICATE-----
MIIDWTCCAkGgAwIBAgIUV+MRxerLcqbxy+ppcq4tNgOhLIUwDQYJKoZIhvcNAQEL
BQAwTTFLMEkGA1UECwxCQW1hem9uIFdlYiBTZXJ2aWNlcyBPPUFtYXpvbi5jb20g
SW5jLiBMPVNlYXR0bGUgU1Q9V2FzaGluZ3RvbiBDPVVTMB4XDTI0MTIwMTAzMzcx
NloXDTQ5MTIzMTIzNTk1OVowHjEcMBoGA1UEAwwTQVdTIElvVCBDZXJ0aWZpY2F0
ZTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBANNrc2KzlzcU39eV1jjl
up4fKdWddxK4JU3wy2+BXcAe889+CB8mZiD4iwexJzekhfHO3jOfOkI+drRA3Z+N
1zFlshbwHLHwHPLRA1XwI43q1YN15OfrHy+qNFVZFMKiddYLB2v701zD83PBNZ+A
rWYB7isLNxG+6BYj+jCerstaPndqslhEQwFVpcCbvOR09MNkUawwey/U39KUrl2e
8FGpo2sEHYBLSjoX4A0DQo6c//tVMoerGwcyj6WJlyDdPeGqKuS2FYgKANmVTNmC
aW/Ct+57rYSR/FGWC3pLwKyD5RDafcZWIGtEcXJA1j8aI13aWMwRxru5X4IhyrwS
GxkCAwEAAaNgMF4wHwYDVR0jBBgwFoAUnP/8/HQTQRSOxl7kSG3AD6sbGrgwHQYD
VR0OBBYEFEuHfyUoEfYm67JAtXJyp8HOEpdtMAwGA1UdEwEB/wQCMAAwDgYDVR0P
AQH/BAQDAgeAMA0GCSqGSIb3DQEBCwUAA4IBAQC2gE6bH9uNHtDaAo7mrtXKYPGi
9kyjEfJKuTL7+uVWIvkH8QV+ePCOl0BtmI2m7tFC1KGUfq/Fc4ci6YgBl2HbhcpE
GZQ223lvg2XY0BoZ+ZcYJkvEoYKhBPLb8ogRDPVBOR1gbX5q7ne72xXMQKjHGej4
vuXchOZFnfChhyZR56rsVCYD/qpe4BvccZ0bId53YeowPfwtlDAKzq5qpv9jNs6J
PmBRwSipowJXpaRf/bnU17ZzOHM9usn48pIK7cg+tGKgp0N6Cvsyz5C8qn8/HZxp
Y8MfjnmwzEDHrg5yrvvMicF7Mvx/l0WiVYKo25FDd7ii7AIDyzdZIKTdnxL8
-----END CERTIFICATE-----
 
 
)KEY";
 
// Device Private Key                                               //change this
static const char AWS_CERT_PRIVATE[] PROGMEM = R"KEY(
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA02tzYrOXNxTf15XWOOW6nh8p1Z13ErglTfDLb4FdwB7zz34I
HyZmIPiLB7EnN6SF8c7eM586Qj52tEDdn43XMWWyFvAcsfAc8tEDVfAjjerVg3Xk
5+sfL6o0VVkUwqJ11gsHa/vTXMPzc8E1n4CtZgHuKws3Eb7oFiP6MJ6uy1o+d2qy
WERDAVWlwJu85HT0w2RRrDB7L9Tf0pSuXZ7wUamjawQdgEtKOhfgDQNCjpz/+1Uy
h6sbBzKPpYmXIN094aoq5LYViAoA2ZVM2YJpb8K37nuthJH8UZYLekvArIPlENp9
xlYga0RxckDWPxojXdpYzBHGu7lfgiHKvBIbGQIDAQABAoIBAC3QqS6IcIp1MZTM
WaH21pwRcMVj3DvoP91GAy/kvuY1Tux2CViGv7cBZU+DalY6hvRBuhFBviRA2QRy
0hQTbsC7ov4phm5g9EUCWlCzO2EztJVKZRKE9zsjDTg5l7Ad+J8rwK374m/F3uoE
wpQQFIN4g548TfDAiBbUMRF8MbDLNscN8G2i/LasRRuOBpWVOmWX059K3aTXVmK5
hiNjIgue1uxEVW1rRnFQRRSFCq75c8vERPQGm5C4mthLI+cI9dr8HZhnCgxQhSFs
FfTjgxH0+WkEd80/8bwpYySKKg7LIRXY3qaVdNMo9v3rN3iwlfBtjSOREPsn1VEq
VdmzkwECgYEA7e9MEQ0grMVB7kIU/fDxO+ZEZpkBUMjV+MK9/95oPo1bNd+svMn0
0MsSIftWOMr3V/Ew6mILJDULZfBvZ+BohkHcM0i4sFNW0hqN05eS5Woo1emTnupM
6oJVwqibVDHnPa/2ELAEmWVeq61hCADweE0yGbyhvhxo6ScfaX7rg+kCgYEA43jI
8g5UwSRNL7p1jASR9nXn6KOrPLi+BjWDiChzjyTfKfbcDUtJ95EBhHHlAQof9uXW
QQDlg69uu4TB/+nPJ2JWcmP9o7r7CvLG4YlKZtR2YkDvG7r5DkZO5dLa9BYm1yo0
Dev00HLGsZB87ZKzsnkt0vVebkhqhNSCII/vT7ECgYBVCrKlZYvINLjb78KRAQ03
25WXFhjiRuYzg2dljJi1wtBW8RtMXuKhvfM9MhgfNGwzgoF5RJG23z6zsLwg5JR3
aBLMQbHBVAg0EEmg1wwp80elLVcV9aiIKQ1+BcV+0ldUNRA95qu+J/0uX0nPEobg
eLbve/xTdtQIgXM4waRsAQKBgCGARHgBzFG1uvhwiadZdPXLX6BPmoSS4MmhUAHZ
k0tdrtBLXxVGJVqkrIiJDaUdjJ+cMfXY3/SI/dH4N2otUSkHvpuSRmS6wQZXwxqs
UZzbZaQK1CxNWSjVCgGnEEAqkwXVXV0/hwq8HK9CDGQg2v5KAomzQXkUiTuO4KtT
B3fBAoGBAIYDaZlTmIDECPpUGh8uOetxbljY6Z7SseQ1u93eJQObPFv6s8Ezbn3K
RIS5KcmzwHLeVY+yLcyAomXJ55xz7rT8uL5Lpf+/2Ar8vQwDiX+VJf/YFYXUwVBz
ykk70FbqhNvpxtb97DC1iOykdcD6pCnX8RzE+91/HHFh5DF9LsuY
-----END RSA PRIVATE KEY-----
 
 
)KEY";