# Projet doit etre rendu

## To run

before anything you need to prepare the data, for that we suggest extracting the json data of wasabi into `public/data`

after that, you could run the prepare_data script to filter out all data we need

```bash
chmod +x prepare_data.sh
./prepare_data.sh
```
Then, please wait until the script is finished, it should run about 5 python scripts which takes around 5 minutes on a 2-core machine. After all data is done being filtered you can proceed by installing dependencies and starting the project.

```bash
npm i
npm run start
```