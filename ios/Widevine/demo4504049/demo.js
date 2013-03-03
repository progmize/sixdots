	var plugin_version;
	function checkInstall(){
        	checkText();
            	if (pluginInstalled()){
                	if(!widevine.versionInstalled(plugin_version)){
                        	initText();
                            	setTimeout("setupPlayer(null);", 2000);
                   	}else{
                           	setTimeout("checkUpgrade();", 1000);
                   	}
             	}else{
              		setTimeout("checkInstall();", 5000);
       		}
 	}

   	function checkUpgrade(){
          	upgradeText();
		pluginInstalled();
           	if(!widevine.versionInstalled(plugin_version)){
                	initText();
                    	setTimeout("setupPlayer(null);", 2000);
            	}else{
                  	setTimeout("checkUpgrade();", 1000);
           	}

 	}

	function pluginInstalled(){
          	var plugin;
            	if ( eval( 'navigator.userAgent.toLowerCase().indexOf("msie") != -1' ) ) {
                	try {
                       		var o = new ActiveXObject("WidevineMediaTransformerInstall.InstallCheck");
                            	plugin_version = o.installVersion;
				if(plugin_version == "0.0.0.0000")
					return false;
				else
                            		return true;
                   	} catch(e) {
                            	return false;
                   	}
          	} else {
                     	plugin = document.getElementById('WidevinePlugin');

                   	if(plugin){
                        	try{
                                	plugin_version = plugin.GetVersion();
                                   	return true;
                          	}catch(e){
                                    	return false;
                            	}
                   	}else{
                        	return false;
                 	}
            	}

  	}

	function checkFlash(){
		flash_version = widevine.flashVersion();
                if (flash_version != ""){
                        major_ver = 0;

                        if(flash_version.indexOf(",") != -1){
                                major_ver = parseInt(flash_version.split(",")[0]);
                        }else if(flash_version.indexOf(".") != -1){
                                major_ver = parseInt(flash_version.split(".")[0]);
                        }

                        if (major_ver < 10){
                                getFlashText();
                        }else{
                                checkInstall();
                        }
                }else{
                        // display place holder flash movie to player
                        dumby();
                }
	}

	function checkFFInstall(){
		// do nothing
	}

	window.onunload = checkFFInstall;
