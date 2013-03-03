var someHTML = '<object ID=flashplayer classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" wmode="opaque" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=8,0,0,0" width="800" height="800" align="middle" VIEWASTEXT>' +
             '<param name="allowScriptAccess" value="sameDomain" />' +
             '<param name="allowFullScreen" value="true" />' +
             '<param name="movie" value="WidevineMediaTransformer_VideoPlayer.swf" />' +
             '<param name="quality" value="high" />' +
	     '<param name="wmode" value="opaque" />' +  
             '<param name="flashvars" value="videoMaxHeight=0&videoMaxWidth=0&__autoPlayURL=http://seafcps002.shibboleth.tv/video/adapt/Full_Metal-Chap10-196.vob" />' + 
'<embed NAME="flashplayer" swLiveConnect="true" src="WidevineMediaTransformer_VideoPlayer.swf" quality="high" name="test" width="800px" height="800px" wmode="opaque" align="middle" allowScriptAccess="sameDomain" flashvars="videoMaxHeight=0&videoMaxWidth=0&__autoPlayURL=http://seafcps002.shibboleth.tv/video/adapt/Full_Metal-Chap10-196.vob" allowFullScreen="true" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" />' +
             '</object>';
document.write(someHTML);

