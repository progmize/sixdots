#!/usr/bin/perl
# start code
use LWP ;
use CGI ;
use MIME::Base64;

$ENV{"REQUEST_METHOD"} =~ tr/a-z/A-Z/;
$query = new CGI;
my $allow         = "yes";

# Error codes less than 512 are reserved for Widevine
my $badStatus     = 600;

#my $url = "https://wstfcps005.shibboleth.tv/widevine/cypherpc/cgi-bin/GetEMMs.cgi";
my $url = "http://10.150.2.8/widevine/cypherpc/cgi-bin/GetEMMs.cgi";

open STORE_FILE, ">/tmp/GetEMMs.vars" || die "Unable to open /tmp/GetEMMs.vars for writing";
my $assetid = 0;
if ( $allow eq "yes" )
{
	  my $ua = LWP::UserAgent->new;
     
# --      get values from the license request
          my $mk            = $query->param('mk');
          my $md            = $query->param('md');
          my $ver           = $query->param('ver');
          my $userdata      = $query->param('userdata');
          my $messageid     = $query->param('messageid');
          my $token         = $query->param('token');
          my $divinfo       = $query->param('divinfo');
          my $extra         = $query->param('extra');
          $assetid          = $query->param('assetid');
          my $clientid      = $query->param('clientid');
          my $sessionid     = $query->param('sessionid');
          my $clienttime    = $query->param('time');

          my %formData = $query->Vars;

# --      add values to the license
	  my $hburlValue = "L2NnaS1iaW4vSGVhcnRiZWF0LmNnaQ==";
	  my $hbintValue = "120";
	  my $ackurlValue = "L2NnaS1iaW4vQWNrLmNnaQ==";

          $formData{"hburl"} = $hburlValue;
          $formData{"hbint"} = $hbintValue;
          $formData{"ackurl"} = $ackurlValue;

# --      Forward license request to Widevine
	  $response = $ua->post( $url, \%formData );

# --      Log the request variables
          print STORE_FILE "REQUEST\n";
	  print STORE_FILE "=======\n";
          print STORE_FILE "mk = $mk\n";
          print STORE_FILE "md = $md\n";
	  print STORE_FILE "ver = $ver\n";
	  print STORE_FILE "assetid = $assetid\n";
	  print STORE_FILE "clientid = $clientid\n";
	  print STORE_FILE "sessionid = $sessionid\n";
	  print STORE_FILE "userdata = $userdata\n";
	  print STORE_FILE "messageid = $messageid\n";
	  print STORE_FILE "token = $token\n";
	  print STORE_FILE "divinfo = $divinfo\n";
	  print STORE_FILE "extra = $extra\n";

	  print STORE_FILE "ackurl = $ackurlValue\n";
	  print STORE_FILE "hburl  = $hburlValue\n";
	  print STORE_FILE "hbint  = $hbintValue\n";

# --      Forward the license response from Widevine back to the client
	  print $query->header(-length=>$response->content_length,
			-type=>$response->content_type);
  	
	  print $response->content;
	  $decoded_response = decode_base64( $response->content );
}
else 
{
        # NOT authorized to play this content 
        $assetid       = $query->param('assetid');
	$badResponse   = pack "NN", $badStatus, $assetid;
	$response = encode_base64($badResponse);
	print $query->header(-length=>length($response),
			-encoding=>base64,
			-type=>"text/plain");
	print $response;
	$decoded_response = decode_base64( $response );
}
print STORE_FILE "\n";

# bytes 0 through 3 contain response status code
# parse response status code
for ( $i = 0; $i < 4; $i++ )
{
  $response_byte = sprintf("%02X", ord(substr($decoded_response, $i, 1)));
  $response_status .= $response_byte;
}
$response_status_dec = hex($response_status);

# bytes 4 through 7 contain response asset id
# parse response asset id
for ( $i = 4; $i < 8; $i++ )
{
  $response_byte = sprintf("%02X", ord(substr($decoded_response, $i, 1)));
  $response_asset_id .= $response_byte;
}
$response_asset_id_dec = hex($response_asset_id);

print STORE_FILE "RESPONSE\n";
print STORE_FILE "========\n";
print STORE_FILE "status = $response_status_dec, asset id = $response_asset_id_dec\n";
close STORE_FILE

# end code
