Berikut adalah perbaikan format dokumen Anda agar memiliki hierarki *heading* yang jelas, poin-poin yang lebih rapi, serta menghilangkan bagian yang terduplikasi pada bab *Project Objectives*.

---

# **Baby Pose Detection System Project Proposal**

## **1. Background**

Safe sleeping practices are critical for infant health and development, particularly during the first year of life. Medical organizations worldwide recommend that babies sleep on their backs (supine position) to reduce the risk of sleep-related incidents and support healthy breathing. However, continuous manual monitoring by parents or caregivers is often difficult, especially during nighttime or when caregivers are occupied with other activities.

With the advancement of Artificial Intelligence (AI), Computer Vision, and pose estimation technologies, it is now possible to automatically monitor a baby's sleeping position in real time using a camera-based system. By analyzing body key-points and posture patterns, the system can identify whether a baby is lying on their back, side, or stomach without requiring wearable sensors that may cause discomfort.

This project introduces an intelligent **Baby Pose Detection System** that leverages Computer Vision and machine learning techniques to provide continuous, non-contact monitoring of infant positions, helping caregivers ensure a safer sleeping environment.

---

## **2. Problem Statement**

Parents and caregivers often face several challenges in monitoring infant sleeping positions:

* **Difficulty in Continuous Supervision:** Constant monitoring is hard to maintain, particularly during nighttime or when performing daily activities.
* **Unintended Position Changes:** Silent shifts in posture may occur while the baby is sleeping, increasing safety concerns without the caregiver's knowledge.
* **Inefficiency of Manual Monitoring:** Manual checks are time-consuming and fail to provide immediate awareness of sudden posture changes.
* **Invasive Existing Solutions:** Current market solutions often rely on wearable devices or specialized sensors, which can be expensive, uncomfortable, or difficult to maintain.
* **Lack of Affordable Technology:** Many households lack access to an affordable and intelligent system capable of automatically detecting infant posture in real time.

---

## **3. Project Objectives**

The primary objective of this project is to develop a Computer Vision-based system capable of automatically detecting and classifying infant sleeping positions in real time.

**Specific objectives include:**

* Detect the presence of a baby using a standard camera.
* Extract body landmarks and key points through pose estimation algorithms.
* Classify infant positions into three main categories:
* **Supine** (Back Sleeping)
* **Prone** (Stomach Sleeping)
* **Side Sleeping**


* Display real-time position information and confidence scores.
* Provide a foundation for future alert and notification systems when unsafe positions are detected.
* Create a low-cost and scalable solution that can be deployed in homes, hospitals, and childcare facilities.

---

## **4. Proposed Solution & System Workflow**

The Baby Pose Detection System utilizes a camera connected to an AI-powered processing unit. Video frames are analyzed continuously using Computer Vision algorithms and pose estimation models to identify key body landmarks, including the head, shoulders, arms, torso, hips, and legs.

The extracted skeletal information is then processed by a machine learning classification model that determines the baby's current position. The result is displayed in real time through an intuitive monitoring interface, showing both the detected position and prediction confidence.

### **System Workflow Steps:**

1. **Video Acquisition:** Capture live stream from a camera or process recorded video.
2. **Baby Detection:** Identify and localize the baby within the video frame.
3. **Key Point Extraction:** Extract body landmarks using pose estimation.
4. **Feature Generation:** Process skeletal coordinates into structured features.
5. **Position Classification:** Determine the posture using the AI model.
6. **Real-Time Visualization:** Display results on a monitoring dashboard.
7. **Warning Generation (Optional):** Trigger alerts for unsafe sleeping positions.

---

## **5. Key Features**

* **Real-time** baby pose detection.
* **Computer Vision-based** non-stop monitoring.
* **AI-powered** posture classification models.
* **Contactless and non-invasive** operation for baby comfort.
* **High detection accuracy** with confidence scoring.
* **Dual input support** for live camera and recorded video.
* **Expandable architecture** for notification and alert systems.
* **Lightweight design** for cost-effective implementation.

---

## **6. Benefits**

### **A. For Parents**

* Provides continuous monitoring without requiring constant physical presence.
* Improves immediate awareness of infant sleeping posture.
* Reduces parental anxiety through automated real-time tracking.
* Supports and reinforces safer sleeping practices.

### **B. For Healthcare Providers**

* Assists medical staff in monitoring infants in neonatal and pediatric care environments.
* Enables objective, automated posture tracking and analysis.
* Supports data-driven observation of infant behavior.

### **C. For Researchers**

* Creates a standardized platform for studying infant movement patterns.
* Provides valuable datasets for future AI and healthcare research.
* Supports the development of advanced infant monitoring technologies.

### **D. For Society**

* Promotes broader public awareness of safe infant sleeping positions.
* Encourages the adoption of AI-based healthcare technologies in daily life.
* Contributes to improving overall infant safety and reducing health risks.

---

## **7. Expected Outcomes**

The final outcome of this project is an intelligent monitoring system capable of accurately identifying infant sleeping positions in real time using Computer Vision technology. The system provides caregivers with actionable information regarding a baby's posture, helping improve safety, reduce monitoring effort, and establish a foundation for future smart nursery and healthcare applications.