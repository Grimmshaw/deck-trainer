package se.lanternakonsult.lanterna;

import android.app.Activity;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;

import com.google.android.play.core.review.ReviewInfo;
import com.google.android.play.core.review.ReviewManager;
import com.google.android.play.core.review.ReviewManagerFactory;

/**
 * Lanterna: opens Google Play's own rating box (the In-App Review API) and closes itself.
 *
 * The web app opens this invisible screen with the link
 * intent://review#Intent;scheme=lanterna;package=se.lanternakonsult.lanterna;end
 * after a passed test or a good practice round (rules in src/store/review.ts).
 * Google decides itself if the box is shown; often nothing happens, and the
 * app never learns if it was shown or what was rated.
 */
public class ReviewActivity extends Activity {
    /** If Google Play does not answer in time, close so the app is never blocked */
    private static final long GIVE_UP_MS = 5000;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private boolean launched = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        overridePendingTransition(0, 0);
        handler.postDelayed(() -> {
            if (!launched) close();
        }, GIVE_UP_MS);

        final ReviewManager manager = ReviewManagerFactory.create(this);
        manager.requestReviewFlow().addOnCompleteListener(request -> {
            if (isFinishing() || launched) return;
            if (!request.isSuccessful()) {
                close();
                return;
            }
            launched = true;
            ReviewInfo info = request.getResult();
            manager.launchReviewFlow(this, info).addOnCompleteListener(done -> close());
        });
    }

    private void close() {
        handler.removeCallbacksAndMessages(null);
        if (!isFinishing()) {
            finish();
            overridePendingTransition(0, 0);
        }
    }

    @Override
    protected void onDestroy() {
        handler.removeCallbacksAndMessages(null);
        super.onDestroy();
    }
}
