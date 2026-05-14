# H365 Troubleshooting & FAQ

This document addresses common issues and frequently asked questions for clinicians and facility administrators.

## 1. Connectivity & Sync Issues
### Q: The status bar says "L-LAN Mode (Offline)". Can I still work?
**A**: Yes. H365 is offline-first. You can register patients, conduct consultations, and order labs. Your data is saved locally to the browser's persistent storage. It will automatically sync to the central server once connectivity is restored.

### Q: I refreshed the page while offline. Did I lose my data?
**A**: No. The `OfflineManager` persists all clinical data to the local disk immediately. Your session and drafts will remain intact.

### Q: Data is not syncing even though the internet is back.
**A**: 
1. Check the **Sync Queue** in the Sidebar footer.
2. If there are "Failed" items, try clicking "Sync Now".
3. Ensure your local facility server (Edge Node) is powered on and connected to the same LAN.

## 2. Patient Registration
### Q: The camera is not starting during registration.
**A**: 
1. Ensure your browser has permission to access the camera (check the lock icon in the address bar).
2. If using a laptop with a physical shutter, ensure it is open.
3. Refresh the page and click "Enable Camera" again.

### Q: I registered a patient but can't find them in the search.
**A**: Verify you are using the correct **National ID**. If you are at a different facility and the data hasn't synced to the central cloud yet, you might need to wait for a sync window.

## 3. Clinical AI Assistant
### Q: The AI is giving a "Connectivity Error".
**A**: The AI requires a broadband connection for real-time inference. If you are in a low-bandwidth zone, your clinical notes will be queued for a "Deferred Audit" which will process once you are back online.

### Q: I disagree with the AI's diagnosis. What should I do?
**A**: Ignore the AI suggestion and enter your own diagnosis in the "Doctor's Comments" field. The AI is a decision-support tool, not a replacement for your clinical judgment. Every rejection helps improve the system's accuracy via the audit log.

## 4. Ward & OT Management
### Q: A bed is marked "Occupied" but the patient was discharged.
**A**: Ensure the discharge process was finalized in the **Ward Management** module. If the patient was transferred, check if they were "Accepted" at the destination.

### Q: I can't start a surgery in the OT module.
**A**: Ensure the **WHO Surgical Safety Checklist** "Sign-In" phase is completed and checked off. The system prevents procedure starts without safety verification.

---

## Technical Support
If an issue persists, please report it to the **Biomedical Engineering** or **IT Department** with the following details:
*   Error Message (if any).
*   Your User ID.
*   The exact time of the incident.
