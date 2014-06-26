#Wrapper for php Applications

##Prepare Project
npm install -g grunt grunt-cli weinre
npm install

##Build & Deploy Project
grunt deploy-local
or 
grunt deploy-remote
###Options "local"
url:  grunt deploy-local -url=127.0.0.1

Specify the URL under which the project is made avialibe (default is to your local ip). Which is recomanded for livereload and weinre to function if the page is called from other devices.

dest: grunt deploy-local -dest=destribution_folder_path

Specify the realtive path to which the destribution is build. Default is to "dest" (aka "./dest")

