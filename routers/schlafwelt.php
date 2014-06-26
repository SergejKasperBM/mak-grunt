<?php
	if ('/' == $_SERVER["REQUEST_URI"]) {
		echo '<!DOCTYPE html><html><head><title></title><meta http-equiv="refresh" content="0; url=index.php?shop=schlafwelt&q=home" /></head><body></body></html>';
	} else {
	    return false;
	}
?>
