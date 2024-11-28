# remove the container if it exists
docker rm -f ilight-server

docker build -t ilight-server .
docker run -it -p 3001:3001 --env-file .env --name ilight-server ilight-server