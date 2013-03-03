var WidevinePlugin;
var widevine = function() {

    var debug = true;
    var debug_flags = "";
   
    var auto_install_upgrade = true;
    var prompt_upgrade = true;

    // Set installer location

    var windows_chrome_installer_exe = "installer/WidevineMediaTransformerChrome.exe";
    var windows_activex_installer_exe = "installer/WidevineMediaTransformer.exe";
    var windows_activex_location_cab = "installer/WidevineMediaTransformer.cab";
    var windows_activex_location_xp_cab = "installer/WidevineMediaTransformer_xp.cab";
    var windows_firefox_location = "installer/WidevineMediaTransformer_windows.xpi";
    var macintosh_firefox_location = "installer/WidevineMediaTransformer_osx.xpi";
    var safari_location = "installer/WidevineMediaTransformer.dmg";

    // Version of plugin pointed by the installer

    var version ="4.5.0.4049";
    var ie_version ="4,5,0,4049";

    // Set the head end server 

    var signon_url = "https://staging.shibboleth.tv/widevine/cypherpc/cgi-bin/SignOn.cgi";
    var log_url = "https://staging.shibboleth.tv/widevine/cypherpc/cgi-bin/LogEncEvent.cgi";
    var emm_url = "http://services.cdtv.lab/VERSION_NUMBER/WidevineRightsManager.aspx";

    // Set the portal

    var portal = "widevine";


    xpi_mac={'Widevine Media Transformer Plugin':macintosh_firefox_location};
    xpi_win={'Widevine Media Transformer Plugin':windows_firefox_location};

    function doDetect( type, value  ) {
        return eval( 'navigator.' + type + '.toLowerCase().indexOf("' + value + '") != -1' );
    }

    var java_installed = false;
    var current_ver = true;
    var no_upgrade = false;

    function detectMac()     { return doDetect( "platform", "mac" );}
    function detectWin32()   { return doDetect( "platform", "win32" );}
    function detectIE()      { return doDetect( "userAgent", "msie" ); }
    function detectFirefox() { return doDetect( "userAgent", "firefox" ); }
    function detectSafari()  { return doDetect( "userAgent", "safari" ); }
    function detectChrome()  { return doDetect( "userAgent", "chrome" ); }

    function detectVistaOrWindows7()   { return doDetect( "userAgent", "windows nt 6" ); }

    function getCookie(c_name)
    {
        if (document.cookie.length>0)
            {
                var c_start=document.cookie.indexOf(c_name + "=")
                    if (c_start!=-1)
                        {
                            c_start=c_start + c_name.length+1;
                            c_end=document.cookie.indexOf(";",c_start);
                            if (c_end==-1) c_end=document.cookie.length;
                            return unescape(document.cookie.substring(c_start,c_end))
                        }
            }
        return ""
    }

    function setCookie(c_name,value,expireseconds)
    {
        var exdate=new Date();
        exdate.setSeconds(exdate.getSeconds()+expireseconds);
        document.cookie=c_name+ "=" +escape(value)+
            ((expireseconds==null) ? "" : ";expires="+exdate.toGMTString())
    }



    function xpinstallCallback(url, status)
    {
        var bPluginExists = false;

        if (status == 0){
            msg = "XPInstall Test:   PASSED\n";
        }else{
            alert("Installation Failed");
            msg = "XPInstall Test:   FAILED\n";
        }
    }

    /////////////////////////////////////////////////////////////////////////////////
    // Start debug output section
    // Used to write debug information to the screen if debug variable is set to true.
    // Only used by test page
    /////////////////////////////////////////////////////////////////////////////////

    function writeDebugCell( name, bold ) {
        if ( bold ) {
            return "<td><b>" + name + "</b></td>";
        } else {
            return "<td><s>" + name + "</s></td>";
        }
    }
    
    function writeDebugMimeArray( values ){
        var result = "";
        for ( value in values ) {
            if ( values[value] ) {
                result += "<td><table><tr><td>" + values[value].description + "</td></tr><tr><td>"+values[value].type+"</td></tr><tr><td>"+values[value].enabledPlugin+"</td></tr></table></td>";
            }
        }
        return result;
    }
    
    function DebugInfo() {
        var result = "";
        result += "<table border=1>";
            
        result += "<tr><td>Platform</td>";
        result += writeDebugCell( "Macintosh", detectMac() );
        result += writeDebugCell( "Windows", detectWin32() );
        if ( detectWin32() ) {
            result += writeDebugCell( "Vista/Windows7", detectVistaOrWindows7() );
        }
        result += "</tr>";
            
        result += "<tr><td>Browser</td>";
        result += writeDebugCell( "IE", detectIE() );
        result += writeDebugCell( "Firefox", detectFirefox() );
        result += writeDebugCell( "Safari", detectSafari() );
        result += writeDebugCell( "Chrome", detectChrome() );
        result += "</tr>";
            
        if ( !detectIE() ) {
            result += "<tr><td>MIME types</td>";
            result += writeDebugMimeArray( navigator.mimeTypes );
            result += "</tr>";
        }

        result += "<tr><td>Installed</td><td>";
        if ( navigator.mimeTypes['application/x-widevinemediatransformer'] ) {
            var aWidevinePlugin = document.getElementById('WidevinePlugin');
            if ( aWidevinePlugin ) {
                result += aWidevinePlugin.GetVersion();
            } else {
                result += "MIME type exists but could not load plugin";
            }
        } else {
            result += "MIME Type Not Found";
        }
        result += "</td></tr>";
            
        result += "</table>";
        return result;
    }
   
    /////////////////////////////////////////////////////////////////////////////////
    // End debug output section
    // Used to write debug information to the screen if debug variable is set to true.
    // Only used by test page
    /////////////////////////////////////////////////////////////////////////////////


    ////////////////////////////////////////////
    // AddDiv
    //
    // Adds a div to the html page
    // html: html to place in the div
    ////////////////////////////////////////////
    function AddDiv( html ) {
        var div = document.createElement( "div" );
        document.body.appendChild( div );
        div.innerHTML = html;
        return div;
    }

    ////////////////////////////////////////////
    // InsertIE8InstallText
    //
    // Displays install instructions for IE8
    // show_refresh: if true shows the refresh text
    ////////////////////////////////////////////
    function InsertIE8InstallText(show_refresh) {
        var installDiv = document.createElement("div");
        installDiv.style.width = '100%';
        installDiv.style.height = '100%';
        installDiv.style.backgroundColor = 'black';
        installDiv.style.left = '0';
        installDiv.style.top = '0';
        installDiv.style.position = 'absolute';
        installDiv.style.zIndex = '10';
        installDiv.style.textAlign = 'center';
        //installDiv.style.filter = 'alpha(opacity=90)';

	var table_width = "50%";
	if (show_refresh){
		table_width = "33%"
	}

        var install_html = "<div align='center' style='margin-top: 20px; background-image: url(install_image.png); width: 800px; height: 600px; font-size: 10pt; font-family: sans-serif'>"
                + "<div style='padding-top: 50px'><table style='width: 100%'>"
		+ "<tr><td style='padding-left: 10px; vertical-align: top'><img src='warning_message.png'>"
		+ "<BR>"
		+ "<div style='font-size: 14pt'><b>Important Message</b></div>"
		+ "<div style='width: 200px; font-size: 12pt'>You may see a warning at the top of your browser prompting you to allow running the add-on.</div>"
		+ "<div style='width: 200px; font-size: 12pt; padding-top: 25px'><b>Note:</b> This warning might also appear after install.</div>"
		+ "</td><td><div style='font-size: 14pt'><b>How to Handle Warning</b></div><div style='width: 200px; font-size: 10pt'>Click the warning and select <b>Run Add-on</b>.</div><img src='step1_warning.png'>"
		+ "<div style='width: 200px; font-size: 10pt'>Click <b>Run</b> when the Security dialog appears</div><img src='security_warning.png'>"
		+"</td></tr>"
                + "</table></div>"
		+ "<div style='padding-top: 25px'><b>Proceed with <u>Install Instructions</u> if warning message does not appear.</b></div>"
		+ "<div style='padding-top: 25px'><table width='100%'>"
		+ "<tr><th colspan='3' style='padding-bottom: 10px; font-size: 14pt'><u>Install Instructions</u></th></tr>"
                + "<tr><td style='padding-left: 10px; width:" + table_width + "; vertical-align: top'>1. Download the installer.<BR><a style='font-weight: bold' href='" + windows_activex_installer_exe + "'>Click to Download</a>"
		+ "<BR><P style='font-size: 10pt'>(If a <b>Security Alert</b> appears stating <b>'Your current security settings do not allow this file to be downloaded.'</b>.  <a href='security.html' target='_blank'>Click Here</a>)</P>"
		+ "</td>"
		+ "<td style='width:" + table_width + "; vertical-align: top'>2. Click <b>Run</b> when the security warning appears.<BR><img src='run_dialog.png'></td>";
	    if (show_refresh){
                install_html += "<td style='width:" + table_width + "; vertical-align: top'>3. <span style='color: red; font-weight: bold'>REFRESH</span> the page after install completes.</td>";
	    }
		install_html += "</tr></table></div>";
	 
	    installDiv.innerHTML = install_html;
        document.body.appendChild(installDiv);

    }

	////////////////////////////////////////////
    	// InsertChromeInstallText
    	//
    	// Displays install instructions for chrome
    	////////////////////////////////////////////
	function InsertChromeInstallText() {
        	var installDiv = document.createElement("div");
        	installDiv.style.width = '100%';
        	installDiv.style.height = '100%';
        	installDiv.style.backgroundColor = 'black';
        	installDiv.style.left = '0';
        	installDiv.style.top = '0';
        	installDiv.style.position = 'absolute';
        	installDiv.style.zIndex = '10';
        	installDiv.style.textAlign = 'center';
        	installDiv.style.filter = 'alpha(opacity=90)';

        	var install_html = "<center><table align='center' style='margin-top: 100px; background-image: url(install_image.png); width: 800px; height: 600px; font-size: 16pt; font-family: sans-serif'>"
                + "<td style='padding-top: 30px; text-align: center'>Please save and run the installer in the status bar.</td></table></center>";
        	installDiv.innerHTML = install_html;
       		document.body.appendChild(installDiv);
		WVPluginCheck();
    }


	////////////////////////////////////////////
        // chromeInstallWin
        //
        // Opens chrome windows installer
        ////////////////////////////////////////////
	function chromeInstallWin(){
        	window.open(windows_chrome_installer_exe,'_blank');
          	InsertChromeInstallText();

	}

	////////////////////////////////////////////
        // chromeInstallMac
        //
        // Opens chrome mac installer
        ////////////////////////////////////////////
	function chromeInstallMac(){
                window.open(safari_location,'_blank');
                InsertChromeInstallText();

        }

	////////////////////////////////////////////
        // pluginInstalledIE
        //
        // Used the InstallCheck plugin to check if WidevineMediaTransformer plugin is installed
	// Note: InstallCheck plugin was introduced in 4.4.5 release
        ////////////////////////////////////////////
    	function pluginInstalledIE(){
		try{
			var o = new ActiveXObject("WidevineMediaTransformerInstall.InstallCheck");
			if (o.installVersion != "0.0.0.0000")
				return true;
			else
				return false;
		}catch(e){
			return false;
		}
    	}

	////////////////////////////////////////////
        // upgradeIEPlugin
        //
        // Used the InstallCheck plugin to check if WidevineMediaTransformer plugin needs to be upgraded
        // Note: InstallCheck plugin was introduced in 4.4.5 release
        ////////////////////////////////////////////
	function upgradeIEPlugin(){
                try{
                        var o = new ActiveXObject("WidevineMediaTransformerInstall.InstallCheck");
                        var ieversion = o.installVersion;
                        return checkVersion(ieversion);
                }catch(e){
                        return false;
                }
        }


	////////////////////////////////////////////
        // EmbedText
        //
        // Returns embed or object tag for the initializing WidevineMediaTransformer plugin
        ////////////////////////////////////////////
	function EmbedText() {
        	if ( detectIE() ) {
	    		if (auto_install_upgrade && !pluginInstalledIE()){
				if (detectVistaOrWindows7() || navigator.appVersion.indexOf("MSIE 8.0") == -1){
	            			var codebase = windows_activex_installer_exe + "#version=" + ie_version;
               				 
					return( '<object id="WidevinePlugin" classid=CLSID:f8eb59ec-35a8-4b59-8f67-b3e19147fed6 ' +
                    				'codebase="' + codebase + '" ' +
                    				'hidden=true style="display:none" height="0" width="0">' +
                    				'<param name="default_url" value="' + signon_url + '">' +
                    				'<param name="emm_url" value="' + emm_url + '">' +
                    				'<param name="log_url" value="' + log_url + '">' +
                    				'<param name="portal" value="' + portal + '">' +
                                                '<param name="user_agent" value="' + navigator.userAgent + '">' +
                    				'</object>' );
            			}else{
		        		InsertIE8InstallText(true);
		       			return "";
            			}
			}else if(!auto_install_upgrade || (pluginInstalledIE() && !upgradeIEPlugin()) ){
				return( '<object id="WidevinePlugin" classid=CLSID:f8eb59ec-35a8-4b59-8f67-b3e19147fed6 ' +
                                       	'hidden=true style="display:none" height="0" width="0">' +
                                       	'<param name="default_url" value="' + signon_url + '">' +
                                      	'<param name="emm_url" value="' + emm_url + '">' +
                                      	'<param name="log_url" value="' + log_url + '">' +
                                       	'<param name="portal" value="' + portal + '">' +
                                        '<param name="user_agent" value="' + navigator.userAgent + '">' +
                                     	'</object>' );
			}else{
				return "";
			}
        	} else {
            		if ( navigator.mimeTypes['application/x-widevinemediatransformer'] ) {
				setCookie("FirefoxDisabledCheck", "");
                		return( '<embed id="WidevinePlugin" type="application/x-widevinemediatransformer" default_url="' + signon_url +
                        		'" emm_url="' + emm_url +
                        		'" log_url="' + log_url +
                        		'" portal="' + portal +
                        		'" height="0" width="0' +
                                        '" user_agent="' + navigator.userAgent +
                        		'">' );
            		} else {
                		return "";
            		}
        	}
    }

    
    ////////////////////////////////////////////
    // EmbedUpgrade
    //
    // Returns embed or object tag for upgrading initializion of WidevineMediaTransformer plugin
    ////////////////////////////////////////////
    function EmbedUpgrade( div , upgrading) {
        if(!auto_install_upgrade){
            	return "";
        }
	if(upgrading && prompt_upgrade){
		if(!confirm("A new version of the Widevine plugin is available.\nWould you like to upgrade?")){
			if (detectIE()){
				div.innerHTML = '<object id="WidevinePlugin" classid=CLSID:f8eb59ec-35a8-4b59-8f67-b3e19147fed6 ' +
                                        'hidden=true style="display:none" height="0" width="0">' +
                                        '<param name="default_url" value="' + signon_url + '">' +
                                        '<param name="emm_url" value="' + emm_url + '">' +
                                        '<param name="log_url" value="' + log_url + '">' +
                                        '<param name="portal" value="' + portal + '">' +
                                        '<param name="user_agent" value="' + navigator.userAgent + '">' +
                                        '</object>' ;
			}
			no_upgrade = true;
			return "";
		}
	}

        if ( detectIE() ) {
		if(upgradeIEPlugin()){
			if (detectVistaOrWindows7() || navigator.appVersion.indexOf("MSIE 8.0") == -1){
                        	var codebase = windows_activex_installer_exe + "#version=" + ie_version;

                            	div.innerHTML = '<object id="WidevinePlugin" classid=CLSID:f8eb59ec-35a8-4b59-8f67-b3e19147fed6 ' +
                                      	'codebase="' + codebase + '" ' +
                                    	'hidden=true style="display:none" height="0" width="0">' +
                                     	'<param name="default_url" value="' + signon_url + '">' +
                                     	'<param name="emm_url" value="' + emm_url + '">' +
                                      	'<param name="log_url" value="' + log_url + '">' +
                                      	'<param name="portal" value="' + portal + '">' +
                                        '<param name="user_agent" value="' + navigator.userAgent + '">' +
                                      	'</object>' ;
                    	}else{
                        	InsertIE8InstallText(true);
                      	}
		}
	} else if(detectChrome()){
		if(detectWin32()){
                	chromeInstallWin();
		}else{
			chromeInstallMac();
		}
        } else if ( detectSafari() ) {
		if(upgrading){
			setTimeout("window.open('" + safari_location + "', '_self');" , 1000);
		}else{	
			setTimeout("if (confirm('Would you like to install the Widevine plugin?')){window.open('" + safari_location + "', '_self');}" , 1000);
        	}
	} else if ( detectFirefox() ) {
	    var install_loop_check = getCookie("FirefoxDisabledCheck")

	    if (install_loop_check != ""){
		var i = parseInt(install_loop_check)
		if (i > 3){
			alert("Please check if 'Widevine Media Transformer Plugin' is disabled.");
		}
		i++;
		setCookie("FirefoxDisabledCheck", "" + i);
	    }else{
		setCookie("FirefoxDisabledCheck", "1");
	    }

            if ( detectMac() ) {
                InstallTrigger.install( xpi_mac, xpinstallCallback );
            } else {
                InstallTrigger.install( xpi_win, xpinstallCallback );
            }
	}
        return "";
    }
 
    ////////////////////////////////////////////
    // upgradeCheck
    //
    // Checks if the WidevineMediaTransformer plugin needs to be upgraded
    // installedVersion: version of the plugin installed
    ////////////////////////////////////////////
    function upgradeCheck(installedVersion){
	if (installedVersion == ""){
		return true;
	}else if (!auto_install_upgrade){
		return false;
	}else if (no_upgrade){
		return false;
	}

	return checkVersion(installedVersion);
    }
	
	////////////////////////////////////////////
    	// checkVersion
    	//
    	// Checks if the installed version is lesser than version in the js
    	// check_version: version of the plugin installed
    	////////////////////////////////////////////
 	function checkVersion(check_version){
		var currentVer = version.split(".");
        	var installedVer = check_version.split(".");

        	if( parseInt(currentVer[0]) > parseInt(installedVer[0]) ){
                	return true;
        	} else if ( (parseInt(currentVer[1]) > parseInt(installedVer[1]))
                        	&& (parseInt(currentVer[0]) == parseInt(installedVer[0])) ){
                	return true;
        	} else if ( (parseInt(currentVer[2]) > parseInt(installedVer[2]))
                        	&& (parseInt(currentVer[1]) == parseInt(installedVer[1])) ){
                	return true;
        	} else if ( (parseInt(currentVer[3]) > parseInt(installedVer[3]))
                        	&& (parseInt(currentVer[2]) == parseInt(installedVer[2])) ){
                	return true;
        	} else {
                	return false;
		}
	}


    return {
	versionInstalled:function(v){
		return upgradeCheck(v);	
	}
	,
    
	flashVersion:function(){
		return current_ver;
	}
	,
    
    init:function() {
	   
	   try{
             	var major_ver = 0;
            	var version = GetSwfVer();
           	if(version.indexOf(" ") != -1){
              		version = version.split(" ")[1];
            	}else if (version.indexOf("=") != -1){
			version = version.split(" ")[1];
		}
        	current_ver = version;

          	if(version.indexOf(",") != -1){
                	major_ver = parseInt(version.split(",")[0]);
             	}else if(version.indexOf(".") != -1){
                     	major_ver = parseInt(version.split(".")[0]);
            	}
           	if (major_ver < 10){
                	alert("Please upgrade to Flash 10+ to continue. Current version: " + current_ver);
			return "";
          	}
     	    }catch(e){
		current_ver = "";
           	alert("Flash not detected. Please install Flash to continue.");
		return "";
            }



	    try {

		var div = AddDiv( EmbedText() );

		if ( debug ) {
		    	AddDiv( DebugInfo() );
		}
	
		if (!detectIE()){
              		var aWidevinePlugin = document.getElementById('WidevinePlugin');	
			if ( aWidevinePlugin == null ){
				EmbedUpgrade( div, false);
			}else if (aWidevinePlugin != null 
				&& (!aWidevinePlugin.GetVersion || upgradeCheck(aWidevinePlugin.GetVersion()))  ){
				EmbedUpgrade( div, true);
			}
		}else{
			if (upgradeIEPlugin()){
				EmbedUpgrade( div, true);
			}
		}
	    }
	    catch(e) {
		alert("widevine.init exception: " + e.message);
	    }
	}
    };
}();

function WVGetURL( arg ) {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
      	try {
        	transformedUrl = aWidevinePlugin.Translate( arg );
      	}
     	catch (err) {
      		return "Error calling Translate: " + err.description;
     	}
       	return transformedUrl;
}
     
function WVGetCommURL () {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
                return aWidevinePlugin.GetCommandChannelBaseUrl();
        } catch (err) {
                //alert("Error calling GetCommandChannelBaseUrl: " + err.description);
        }
        return "http://localhost:20001/cgi-bin/";
}

function WVSetPlayScale( arg ) {
	var aWidevinePlugin = document.getElementById('WidevinePlugin');
      	try {
       		return aWidevinePlugin.SetPlayScale( arg );
       	}
       	catch (err) {
       		alert ("Error calling SetPlayScale: " + err.description);
       	}
       	return 0;
}

function WVGetMediaTime( arg ) {
      	var aWidevinePlugin = document.getElementById('WidevinePlugin');
       	try {
         	return aWidevinePlugin.GetMediaTime( arg );
       	} catch (err) {
         	alert("Error calling GetMediaTime: " + err.description);
      	}
       	return 0;
}

function WVGetClientId() {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
                return aWidevinePlugin.getClientId();
        }
        catch (err) {
                alert ("Error calling GetClientId: " + err.description);
        }
        return 0;
}


function WVSetDeviceId(arg) {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
               return aWidevinePlugin.setDeviceId(arg);
        }
        catch (err) {
                alert ("Error calling SetDeviceId: " + err.description);
        }
        return 0;
}

function WVSetStreamId(arg) {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
               return aWidevinePlugin.setStreamId(arg);
        }
        catch (err) {
                alert ("Error calling SetStreamId: " + err.description);
        }
        return 0;
}

function WVSetClientIp(arg) {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
               return aWidevinePlugin.setClientIp(arg);
        }
        catch (err) {
                alert ("Error calling SetClientIp: " + err.description);
        }
        return 0;
}

function WVSetEmmURL(arg) {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
               return aWidevinePlugin.setEmmUrl(arg);
        }
        catch (err) {
                alert ("Error calling SetEmmURL: " + err.description);
        }
        return 0;
}


function WVSetEmmAckURL(arg) {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
               return aWidevinePlugin.setEmmAckUrl(arg);
        }
        catch (err) {
                alert ("Error calling SetEmmAckUrl: " + err.description);
        }
        return 0;
}

function WVSetHeartbeatUrl(arg) {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
               return aWidevinePlugin.setHeartbeatUrl(arg);
        }
        catch (err) {
                alert ("Error calling SetHeartbeatUrl: " + err.description);
        }
        return 0;
}


function WVSetHeartbeatPeriod(arg) {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
               return aWidevinePlugin.setHeartbeatPeriod(arg);
        }
        catch (err) {
                alert ("Error calling SetHeartbeatPeriod: " + err.description);
        }
        return 0;
}



function WVSetOptData(arg) {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
               return aWidevinePlugin.setOptData(arg);
        }
        catch (err) {
                alert ("Error calling SetOptData: " + err.description);
        }
        return 0;
}

function WVGetDeviceId() {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
               return aWidevinePlugin.getDeviceId();
        }
        catch (err) {
                alert ("Error calling GetDeviceId: " + err.description);
        }
        return 0;
}

function WVGetStreamId() {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
               return aWidevinePlugin.getStreamId();
        }
        catch (err) {
                alert ("Error calling GetStreamId: " + err.description);
        }
        return 0;
}

function WVGetClientIp() {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
               return aWidevinePlugin.getClientIp();
        }
        catch (err) {
                alert ("Error calling GetClientIp: " + err.description);
        }
        return 0;
}


function WVGetEmmURL() {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
               return aWidevinePlugin.getEmmUrl();
        }
        catch (err) {
                alert ("Error calling GetEmmURL: " + err.description);
        }
        return "";
}


function WVGetEmmAckURL() {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
               return aWidevinePlugin.getEmmAckUrl();
        }
        catch (err) {
                alert ("Error calling GetEmmAckUrl: " + err.description);
        }
        return "";
}

function WVGetHeartbeatUrl() {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
               return aWidevinePlugin.getHeartbeatUrl();
        }
        catch (err) {
                alert ("Error calling GetHeartbeatUrl: " + err.description);
        }
        return "";
}



function WVGetHeartbeatPeriod() {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
               return aWidevinePlugin.getHeartbeatPeriod();
        }
        catch (err) {
                alert ("Error calling GetHeartbeatPeriod: " + err.description);
        }
        return "";
}


function WVGetOptData() {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
               return aWidevinePlugin.getOptData();
        }
        catch (err) {
                alert ("Error calling GetOptData: " + err.description);
        }
        return "";
}


function WVAlert( arg ) {
	alert(arg);
     	return 0;
}

////////////////////////////////////////////////////////
// WVPluginCheck
//
// Helper function for chrome installer.  This function continues until the installed plugin version
// is equal to or greater than the version in the js.
///////////////////////////////////////////////////////

function WVPluginCheck(){
	try{
		navigator.plugins.refresh(false);
		if ( navigator.mimeTypes['application/x-widevinemediatransformer'] ) {
			var cur_ver = WVGetPluginVersionFromEmbed();
			//alert(cur_ver);
			if(!widevine.versionInstalled(cur_ver)){
				window.location.reload();
			}else{
				setTimeout("WVPluginCheck()", 15000);
			}
		}else{
			setTimeout("WVPluginCheck()", 2000);
		}
	}catch(e){
		//alert("WVPluginCheck: " + e.name + " "+ e.message);
	}
}

///////////////////////////////////////////////////////
// WVGetPluginVersionFromEmbed
//
// Gets the plugin version using the embed tag
///////////////////////////////////////////////////////
function WVGetPluginVersionFromEmbed(){
	var tmp_version = "";
	try{
		var tmp_wv = document.createElement('div'); 
		tmp_wv.id = 'tmpWv';
		tmp_wv.innerHTML = '<embed id="tmpWidevinePlugin" type="application/x-widevinemediatransformer" >'
		document.body.appendChild(tmp_wv);
		if(document.getElementById("tmpWidevinePlugin")){
			try{
				tmp_version = document.getElementById("tmpWidevinePlugin").GetVersion();
			}catch(e){
			
			}
			document.body.removeChild(tmp_wv);
		}
	}catch(e){
		//alert("WVGetPluginVersionFromEmbed: " + e.name + "  " + e.message);
	}
	return tmp_version;
	
}

function WVPDLNew(mediaPath, pdlPath) {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
                pdl_new =  aWidevinePlugin.PDL_New(mediaPath, pdlPath);
                return pdl_new;
        }
        catch (err) {
               //alert ("Error calling PDL_New: " + err.description);
        }
        return "";
}

function WVPDLStart(pdlPath, trackNumber, trickPlay) {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
               return aWidevinePlugin.PDL_Start(pdlPath, trackNumber, trickPlay);
        }
        catch (err) {
               //alert ("Error calling PDL_Start: " + err.description);
        }
        return "";
}

function WVPDLResume(pdlPath) {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
               return aWidevinePlugin.PDL_Resume(pdlPath);
        }
        catch (err) {
               //alert ("Error calling PDL_Resume: " + err.description);
        }
        return "";
}


function WVPDLStop(pdlPath) {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
               return aWidevinePlugin.PDL_Stop(pdlPath);
        }
        catch (err) {
               //alert ("Error calling PDL_Stop: " + err.description);
        }
        return "";
}

function WVPDLCancel(pdlPath) {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
               return aWidevinePlugin.PDL_Cancel(pdlPath);
        }
        catch (err) {
               //alert ("Error calling PDL_Stop: " + err.description);
        }
        return "";
}

function WVPDLGetProgress(pdlPath) {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
               return aWidevinePlugin.PDL_GetProgress(pdlPath);
        }
        catch (err) {
               //alert ("Error calling PDL_GetProgress: " + err.description);
        }
        return "";
}


function WVPDLGetTotalSize(pdlPath) {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
               return aWidevinePlugin.PDL_GetTotalSize(pdlPath);
        }
        catch (err) {
               //alert ("Error calling PDL_GetTotalSize: " + err.description);
        }
        return "";
}

function WVPDLFinialize(pdlPath) {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
               return aWidevinePlugin.PDL_Finialize(pdlPath);
        }
        catch (err) {
               //alert ("Error calling PDL_Finialize: " + err.description);
        }
        return "";
}

function WVPDLCheckHasTrickPlay(pdlPath) {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
               return aWidevinePlugin.PDL_CheckHasTrickPlay(pdlPath);
        }
        catch (err) {
               //alert ("Error calling PDL_CheckHasTrickPlay: " + err.description);
        }
        return "";
}

function WVPDLGetTrackBitrate(pdlPath, trackNumber) {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
               return aWidevinePlugin.PDL_GetTrackBitrate(pdlPath, trackNumber);
        }
        catch (err) {
               //alert ("Error calling PDL_GetTrackBitrate: " + err.description);
        }
        return "";
}

function WVPDLGetTrackCount(pdlPath) {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
               return aWidevinePlugin.PDL_GetTrackCount(pdlPath);
        }
        catch (err) {
                //alert ("Error calling PDL_GetTrackCount: " + err.description);
        }
        return "";
}

function WVPDLGetDownloadMap(pdlPath) {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
               return aWidevinePlugin.PDL_GetDownloadMap(pdlPath);
        }
        catch (err) {
                //alert ("Error calling PDL_GetDownloadMap: " + err.description);
        }
        return "";
}

function WVPDLGetLastError() {
        var aWidevinePlugin = document.getElementById('WidevinePlugin');
        try {
               return aWidevinePlugin.PDL_GetLastError();
        }
        catch (err) {
               //alert ("Error calling PDL_GetLastError: " + err.description);
        }
        return "";
}


widevine.init();



