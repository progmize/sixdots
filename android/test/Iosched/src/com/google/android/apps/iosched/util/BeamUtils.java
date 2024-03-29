/*
 * Copyright 2012 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.google.android.apps.iosched.util;

import com.google.android.apps.iosched.provider.ScheduleContract;

import android.annotation.TargetApi;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.nfc.NdefMessage;
import android.nfc.NdefRecord;
import android.nfc.NfcAdapter;
import android.os.Build;
import android.os.Parcelable;
import android.preference.PreferenceManager;

/**
 * Android Beam helper methods.
 */
public class BeamUtils {

    private static final byte[] DEFAULT_BEAM_MIME =
            "application/vnd.google.iosched.default".getBytes();

    private static final String PREF_BEAM_STATE = "beam_state";
    private static final int BEAM_STATE_UNLOCKED = 0x1481;
    private static final int BEAM_STATE_LOCKED = 0x0;

    /**
     * Sets this activity's Android Beam message to one representing the given session.
     */
    @TargetApi(Build.VERSION_CODES.ICE_CREAM_SANDWICH)
    public static void setBeamSessionUri(Activity activity, Uri sessionUri) {
        if (UIUtils.hasICS()) {
            NfcAdapter nfcAdapter = NfcAdapter.getDefaultAdapter(activity);
            if (nfcAdapter == null) {
                // No NFC :-(
                return;
            }

            nfcAdapter.setNdefPushMessage(new NdefMessage(
                    new NdefRecord[]{
                            new NdefRecord(NdefRecord.TNF_MIME_MEDIA,
                                    ScheduleContract.Sessions.CONTENT_ITEM_TYPE.getBytes(),
                                    new byte[0],
                                    sessionUri.toString().getBytes())
                    }), activity);
        }
    }

    /**
     * Sets this activity's Android Beam message to the default.
     */
    @TargetApi(Build.VERSION_CODES.ICE_CREAM_SANDWICH)
    public static void setDefaultBeamUri(Activity activity) {
        if (UIUtils.hasICS()) {
            NfcAdapter nfcAdapter = NfcAdapter.getDefaultAdapter(activity);
            if (nfcAdapter == null) {
                // No NFC :-(
                return;
            }

            nfcAdapter.setNdefPushMessage(new NdefMessage(
                    new NdefRecord[]{
                            new NdefRecord(NdefRecord.TNF_MIME_MEDIA,
                                    DEFAULT_BEAM_MIME,
                                    new byte[0],
                                    new byte[0])
                    }), activity);
        }
    }

    public static boolean isBeamUnlocked(Context context) {
        SharedPreferences prefs = PreferenceManager.getDefaultSharedPreferences(context);
        return (prefs.getInt(PREF_BEAM_STATE, BEAM_STATE_LOCKED) == BEAM_STATE_UNLOCKED);
    }

    @TargetApi(Build.VERSION_CODES.ICE_CREAM_SANDWICH)
    public static void setBeamUnlocked(Context context) {
        SharedPreferences prefs = PreferenceManager.getDefaultSharedPreferences(context);
        prefs.edit().putInt(PREF_BEAM_STATE, BEAM_STATE_UNLOCKED).commit();
    }

    @TargetApi(Build.VERSION_CODES.ICE_CREAM_SANDWICH)
    public static boolean wasLaunchedThroughBeamFirstTime(Context context, Intent intent) {
        return intent != null
                && UIUtils.hasICS()
                && NfcAdapter.ACTION_NDEF_DISCOVERED.equals(intent.getAction())
                && !isBeamUnlocked(context);

    }

    /**
     * Checks to see if the activity's intent ({@link android.app.Activity#getIntent()}) is
     * an NFC intent that the app recognizes. If it is, then parse the NFC message and set the
     * activity's intent (using {@link Activity#setIntent(android.content.Intent)}) to something
     * the app can recognize (i.e. a normal {@link Intent#ACTION_VIEW} intent).
     */
    @TargetApi(Build.VERSION_CODES.ICE_CREAM_SANDWICH)
    public static void tryUpdateIntentFromBeam(Activity activity) {
        if (UIUtils.hasICS()) {
            Intent originalIntent = activity.getIntent();
            if (NfcAdapter.ACTION_NDEF_DISCOVERED.equals(originalIntent.getAction())) {
                Parcelable[] rawMsgs = originalIntent.getParcelableArrayExtra(
                        NfcAdapter.EXTRA_NDEF_MESSAGES);
                NdefMessage msg = (NdefMessage) rawMsgs[0];
                // Record 0 contains the MIME type, record 1 is the AAR, if present.
                // In iosched, AARs are not present.
                NdefRecord mimeRecord = msg.getRecords()[0];
                if (ScheduleContract.Sessions.CONTENT_ITEM_TYPE.equals(
                        new String(mimeRecord.getType()))) {
                    // Re-set the activity's intent to one that represents session details.
                    Intent sessionDetailIntent = new Intent(Intent.ACTION_VIEW,
                            Uri.parse(new String(mimeRecord.getPayload())));
                    activity.setIntent(sessionDetailIntent);
                }
            }
        }
    }

    @TargetApi(Build.VERSION_CODES.ICE_CREAM_SANDWICH)
    public static void setBeamCompleteCallback(Activity activity,
            NfcAdapter.OnNdefPushCompleteCallback callback) {

        if (UIUtils.hasICS()) {
            NfcAdapter adapter = NfcAdapter.getDefaultAdapter(activity);
            if (adapter == null) {
                return;
            }
            adapter.setOnNdefPushCompleteCallback(callback, activity);
        }
    }

    public static void launchBeamSession(Context context) {
        context.startActivity(new Intent(Intent.ACTION_VIEW,
                ScheduleContract.Sessions.buildSessionUri("gooio2012/125/")));
    }
}
