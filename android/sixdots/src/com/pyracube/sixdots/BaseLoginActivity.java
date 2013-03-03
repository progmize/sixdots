package com.pyracube.sixdots;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.os.Bundle;
import android.view.Window;
import android.webkit.WebSettings;
import android.webkit.WebView;

@SuppressLint("SetJavaScriptEnabled")
public abstract class BaseLoginActivity extends Activity {

	final int _layoutResId;
	final int _webViewId;
	WebView _webView;

	protected WebView getWebView() {
		return _webView;
	}

	public BaseLoginActivity(int layoutResId, int webViewId) {
		_layoutResId = layoutResId;
		_webViewId = webViewId;
		//Test
	}

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		requestWindowFeature(Window.FEATURE_PROGRESS);

		setContentView(_layoutResId);
		setupWebView();
		afterOnCreate();
	}

	protected void afterOnCreate() {

	}

	protected void openWebpage() {

	}

	private void setupWebView() {
		_webView = (WebView) findViewById(_webViewId);
		WebSettings websettings = _webView.getSettings();
		websettings.setJavaScriptEnabled(true);
	}

}
