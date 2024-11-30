docker build -t crissvictor/ilight-server .
docker push crissvictor/ilight-server

kubectl apply -f deployment.yaml