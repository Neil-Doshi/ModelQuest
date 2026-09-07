/* ModelQuest v11 — authored curriculum source of truth.
 * This file intentionally owns the learner-facing project metadata and runnable code.
 * Legacy PROJECTS is updated from this source so search, code screens and older renderers
 * cannot drift back to student/sports/movie examples.
 */
(() => {
  const C = [
    {
      id:1, stage:'FOUNDATIONS', title:'Sensor Calibration', subtitle:'Linear Regression', difficulty:1, time:'45–60 min',
      hook:'A force sensor gives us voltage. Later we will know the voltage but not the force. How can examples teach us a useful conversion rule?',
      goal:'Understand why prediction, graphs, rate of change, slope, error, loss and a fitted straight line exist before naming Linear Regression.',
      prerequisites:['Run one notebook cell','Read a simple x/y graph','Subtraction and division'],
      concepts:['measurement','example','data','input / feature','target / label','rate of change','slope','intercept','residual','loss','linear regression','gradient descent'],
      missions:['See why one measurement is not enough','Graph voltage against force','Calculate change per volt by hand','Compare a line with a curve','Fit one line to all readings','Explain one prediction in newtons'],
      baseline:'Before ML, use the average measured force for every new reading. The learned line should beat that because it uses voltage information.',
      expected:'With the five supplied calibration pairs, the fitted slope is about 25.57 N/V and 1.05 V predicts about 26 N.',
      environment:'CPU is enough. NumPy and scikit-learn are normally preinstalled in Google Colab.',
      challenge:'Add one suspicious calibration reading. Compare the fitted line before and after it, then decide whether you would re-measure, keep, or remove it and explain why.',
      real:['A strange point is a reason to investigate the measurement, not automatically delete it.','A straight line is sensible only while the rate of change is roughly constant.','Units matter: a slope in N/V has a physical meaning that disappears if units are mixed.'],
      code:`# MODEL 1 — Sensor calibration: voltage -> force
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error

voltage = np.array([0.42, 0.81, 1.22, 1.60, 1.98]).reshape(-1, 1)
force_n = np.array([10, 20, 30, 40, 50])

# Simple baseline: ignore voltage and always guess the average force.
baseline = np.full_like(force_n, force_n.mean(), dtype=float)
print('Baseline MAE:', round(mean_absolute_error(force_n, baseline), 2), 'N')

model = LinearRegression().fit(voltage, force_n)
train_pred = model.predict(voltage)
print('Slope:', round(model.coef_[0], 2), 'N/V')
print('Intercept:', round(model.intercept_, 2), 'N')
print('Model MAE:', round(mean_absolute_error(force_n, train_pred), 2), 'N')

new_voltage = 1.05
print('Force at 1.05 V:', round(model.predict([[new_voltage]])[0], 2), 'N')`
    },
    {
      id:2, stage:'FOUNDATIONS', title:'Quality Gate', subtitle:'Logistic Regression', difficulty:1, time:'50–65 min',
      hook:'Inspection is not asking for another number. It asks PASS or FAIL. Why does that require a different kind of prediction?',
      goal:'Build the need for classification, probability-like scores and decision thresholds before introducing Logistic Regression terminology.',
      prerequisites:['Model 1: input vs target','Model 1: prediction error','Percentages between 0 and 100'],
      concepts:['classification','score','probability','threshold','false accept','false reject','confusion matrix','precision','recall','logistic regression'],
      missions:['See why an unrestricted line is awkward for PASS/FAIL','Turn a score into a decision','Move the threshold','Count four kinds of outcomes','Choose which mistake matters more'],
      baseline:'Always predict the most common class. A useful classifier must beat that baseline on the mistakes that matter, not only on total accuracy.',
      expected:'Lowering the threshold should catch more defective parts but usually reject more good parts too.',
      environment:'CPU is enough. NumPy and scikit-learn are normally preinstalled in Colab.',
      challenge:'Lower the FAIL threshold to catch more defects. Record what happens to missed defects and false rejects, then choose a threshold for a safety-critical part.',
      real:['Threshold 0.5 is a convention, not a law.','Accuracy can hide dangerous performance when failures are rare.','A score is useful only after checking whether its decisions match real costs.'],
      code:`# MODEL 2 — Machined-part quality gate
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix, recall_score

rng = np.random.default_rng(7)
n = 600
thickness_error = np.abs(rng.normal(0.035, 0.03, n))
roughness_ra = np.abs(rng.normal(1.4, 0.8, n))
hole_error = np.abs(rng.normal(0.02, 0.018, n))
risk = 18*thickness_error + 0.7*roughness_ra + 22*hole_error + rng.normal(0, .6, n)
y = (risk > 2.0).astype(int)  # 1 = FAIL
X = np.column_stack([thickness_error, roughness_ra, hole_error])

Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=.25, random_state=42, stratify=y)
model = make_pipeline(StandardScaler(), LogisticRegression(class_weight='balanced')).fit(Xtr, ytr)
prob_fail = model.predict_proba(Xte)[:, 1]

for threshold in [0.50, 0.35]:
    pred = (prob_fail >= threshold).astype(int)
    print('\nThreshold', threshold)
    print(confusion_matrix(yte, pred))
    print('Failure recall:', round(recall_score(yte, pred), 3))`
    },
    {
      id:3, stage:'FOUNDATIONS', title:'Machine State Locator', subtitle:'KNN + SVM', difficulty:2, time:'60–75 min',
      hook:'A new vibration/temperature reading appears. If we do not have a simple equation, can similar old machine states help us classify it?',
      goal:'Create the need for similarity, distance, scaling, neighbors and decision boundaries before naming KNN and SVM.',
      prerequisites:['Model 2: classification','Graph coordinates','Square and square-root intuition'],
      concepts:['similarity','distance','feature scaling','nearest neighbors','K','decision boundary','margin','support vector','kernel'],
      missions:['Measure closeness between two readings','Break distance with mismatched scales','Repair it with scaling','Change K','Compare local voting with a learned boundary'],
      baseline:'Nearest-neighbor reasoning should be compared with a simple majority-class guess and with the same KNN model before scaling.',
      expected:'Artificially multiplying temperature by 1000 should damage unscaled KNN. StandardScaler should largely repair the geometry.',
      environment:'CPU is enough. NumPy and scikit-learn are normally preinstalled in Colab.',
      challenge:'Create the giant-scale temperature feature, observe unscaled KNN, then add scaling and explain why the physical machine did not change even though the model improved.',
      real:['Distance is numerical geometry; units can dominate it.','K too small can follow noise; K too large can wash out local structure.','A clean-looking SVM boundary is not proof that the underlying data is trustworthy.'],
      code:`# MODEL 3 — Machine state classification: deliberately break KNN, then fix it
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

rng = np.random.default_rng(4)
normal = rng.normal([1.5, 60, 45], [.4, 5, 10], (150, 3))
unbalanced = rng.normal([5.0, 70, 55], [.8, 6, 12], (130, 3))
overload = rng.normal([2.5, 88, 92], [.6, 5, 6], (130, 3))
X = np.vstack([normal, unbalanced, overload])
y = np.array([0]*150 + [1]*130 + [2]*130)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=.25, random_state=42, stratify=y)

# Break the geometry: temperature suddenly uses a scale 1000x larger.
Xtr_bad, Xte_bad = Xtr.copy(), Xte.copy()
Xtr_bad[:, 1] *= 1000
Xte_bad[:, 1] *= 1000

raw_knn = KNeighborsClassifier(n_neighbors=7).fit(Xtr_bad, ytr)
scaled_knn = make_pipeline(StandardScaler(), KNeighborsClassifier(n_neighbors=7)).fit(Xtr_bad, ytr)
svm = make_pipeline(StandardScaler(), SVC(C=2, kernel='rbf')).fit(Xtr_bad, ytr)
print('Unscaled KNN:', round(raw_knn.score(Xte_bad, yte), 3))
print('Scaled KNN  :', round(scaled_knn.score(Xte_bad, yte), 3))
print('Scaled SVM  :', round(svm.score(Xte_bad, yte), 3))`
    },
    {
      id:4, stage:'FOUNDATIONS', title:'Late Shipment Predictor', subtitle:'Decision Tree', difficulty:2, time:'50–65 min',
      hook:'People often reason with questions: Is backlog high? Is the route long? Can a machine learn useful questions instead of receiving them from us?',
      goal:'Build branching decisions, split quality and overfitting from simple questions before introducing tree terminology.',
      prerequisites:['Model 2: classification','If/else idea','Fractions such as 8 late out of 10'],
      concepts:['question / split','branch','leaf','mixed group','impurity','Gini','tree depth','overfitting','pruning'],
      missions:['Split shipments with one question','See why one split is not enough','Compare good and bad splits','Grow depth','Watch training and test scores separate'],
      baseline:'Always predict the majority shipment outcome, then compare a shallow tree against that baseline and against an over-deep tree.',
      expected:'Training accuracy should keep rising with depth; unseen-data performance should usually peak earlier.',
      environment:'CPU is enough. NumPy and scikit-learn are normally preinstalled in Colab.',
      challenge:'Grow until training accuracy is nearly perfect, then find the shallowest depth with similar or better unseen-shipment performance.',
      real:['A deep tree can memorize quirks.','Feature importance is not causation.','Readable rules can still encode biased or leaked data.'],
      code:`# MODEL 4 — Late shipment predictor: depth vs overfitting
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

rng = np.random.default_rng(12); n = 800
distance = rng.uniform(20, 1400, n)
queue_hours = rng.gamma(2.2, 4, n)
weather_delay = rng.binomial(1, .18, n)
express = rng.binomial(1, .35, n)
risk = .0015*distance + .09*queue_hours + 1.1*weather_delay - .7*express + rng.normal(0, .5, n)
y = (risk > 1.8).astype(int)
X = np.column_stack([distance, queue_hours, weather_delay, express])
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=.25, random_state=42, stratify=y)

baseline = max((yte == 0).mean(), (yte == 1).mean())
print('Majority baseline:', round(baseline, 3))
for depth in [1, 2, 3, 5, 8, 12, None]:
    m = DecisionTreeClassifier(max_depth=depth, random_state=42).fit(Xtr, ytr)
    print(depth, 'train', round(m.score(Xtr, ytr), 3), 'test', round(m.score(Xte, yte), 3))`
    },
    {
      id:5, stage:'REAL ML', title:'Predictive Maintenance', subtitle:'Random Forest + Boosting', difficulty:3, time:'70–90 min',
      hook:'One tree can change a lot when a few examples change. Can a group of different trees make failure prediction more stable?',
      goal:'Create the need for ensembles, rare-failure metrics and leakage by first making one tree unreliable.',
      prerequisites:['Model 4: tree depth and overfitting','Model 2: recall','Train/test split'],
      concepts:['ensemble','bagging','random forest','boosting','rare class','recall','data leakage','pipeline'],
      missions:['Compare one tree with many','See voting stabilize predictions','Make failures rare','Create a leakage feature','Watch an impossible score jump','Remove the leak'],
      baseline:'Compare against always predicting HEALTHY and against one decision tree before trusting a forest or boosted model.',
      expected:'The leaked feature should make validation look suspiciously excellent. Removing it should lower the score but make the experiment honest.',
      environment:'CPU is enough. NumPy, pandas and scikit-learn are normally preinstalled in Colab.',
      challenge:'Add future_repair_flag, compare honest vs leaked performance, then explain why the lower honest score is the one you would trust.',
      real:['Leakage can make perfectly running code produce a meaningless score.','Rare failures make raw accuracy misleading.','Operational cost should decide which errors matter most.'],
      code:`# MODEL 5 — Predictive maintenance: honest model vs leaked model
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, recall_score

rng = np.random.default_rng(10); n = 1800
df = pd.DataFrame({
    'temperature': rng.normal(70, 12, n),
    'vibration': rng.gamma(2, 1.2, n),
    'current': rng.normal(4.8, .7, n),
    'age_months': rng.integers(1, 120, n)
})
risk = (df.temperature > 85).astype(int) + (df.vibration > 4).astype(int) + (df.age_months > 80).astype(int)
y = ((risk + rng.binomial(1, .12, n)) >= 2).astype(int)
Xtr, Xte, ytr, yte = train_test_split(df, y, test_size=.25, random_state=42, stratify=y)

honest = RandomForestClassifier(n_estimators=200, class_weight='balanced', random_state=42).fit(Xtr, ytr)
hp = honest.predict(Xte)
print('HONEST accuracy/recall:', round(accuracy_score(yte, hp),3), round(recall_score(yte, hp),3))

# Leakage: this variable would only be known after the failure/repair decision.
Xtr_leak, Xte_leak = Xtr.copy(), Xte.copy()
Xtr_leak['future_repair_flag'] = ytr
Xte_leak['future_repair_flag'] = yte
leaked = RandomForestClassifier(n_estimators=200, random_state=42).fit(Xtr_leak, ytr)
lp = leaked.predict(Xte_leak)
print('LEAKED accuracy/recall:', round(accuracy_score(yte, lp),3), round(recall_score(yte, lp),3))`
    },
    {
      id:6, stage:'REAL ML', title:'Hidden Machine Modes', subtitle:'K-Means + PCA', difficulty:3, time:'65–80 min',
      hook:'Months of telemetry exist, but nobody labeled operating modes. Can structure appear when there is no correct answer column?',
      goal:'Create the need for unsupervised learning, centroids and dimensionality reduction from unlabeled machine telemetry.',
      prerequisites:['Model 3: distance and scaling','Average / mean','Idea of 2D vs many measurements'],
      concepts:['unlabeled data','cluster','centroid','K-Means','K','silhouette','dimension','variance','PCA','projection'],
      missions:['Group points manually','Move centroids','Change K from 2 through 8','See a score prefer some K values','Compress 5 measurements to 2','Question whether clusters are physically real'],
      baseline:'There is no label-based accuracy baseline. Compare cluster compactness and stability, then require an engineering interpretation before calling a group meaningful.',
      expected:'The synthetic data contains three broad modes, so K near 3 should usually score better than forcing many fragmented groups.',
      environment:'CPU is enough. NumPy and scikit-learn are normally preinstalled in Colab.',
      challenge:'Test K from 2 through 8. Choose a mathematically plausible K, then explain why that number alone does not prove the machine has exactly that many real modes.',
      real:['K-Means always returns K groups even if the world does not contain K meaningful groups.','Scaling changes geometry and therefore clustering.','PCA is a projection; a clean 2D picture can hide differences in discarded dimensions.'],
      code:`# MODEL 6 — Hidden machine modes: K-Means + PCA
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score

rng = np.random.default_rng(4)
idle = rng.normal([700, 1.7, .7, 48, 52], [70, .25, .18, 3, 3], (120, 5))
normal = rng.normal([1450, 3.5, 1.3, 63, 61], [100, .4, .3, 4, 4], (150, 5))
heavy = rng.normal([2250, 6.1, 3.8, 82, 76], [130, .6, .7, 5, 5], (120, 5))
X = np.vstack([idle, normal, heavy])
Xs = StandardScaler().fit_transform(X)

for k in range(2, 9):
    labels = KMeans(n_clusters=k, n_init='auto', random_state=42).fit_predict(Xs)
    print('K=', k, 'silhouette=', round(silhouette_score(Xs, labels), 3))

labels = KMeans(n_clusters=3, n_init='auto', random_state=42).fit_predict(Xs)
xy = PCA(n_components=2).fit_transform(Xs)
print('PCA 2D shape:', xy.shape, 'clusters:', np.bincount(labels))`
    },
    {
      id:7, stage:'NEURAL NETWORKS', title:'Sensor Fusion Brain', subtitle:'Neural Network / MLP', difficulty:3, time:'90–120 min',
      hook:'What if temperature, torque and vibration interact in ways a single line or simple split cannot capture?',
      goal:'Build weights, bias, neurons, activation, layers and training from the need to combine several clues with different importance.',
      prerequisites:['Model 1: loss and gradient descent','Weighted-sum bridge','Vector and matrix bridge','Derivative as sensitivity bridge'],
      concepts:['weight','bias','weighted sum','neuron','activation','ReLU','layer','forward pass','loss','backpropagation','epoch'],
      missions:['Build one weighted calculation','See why stacked linear operations still stay linear','Add ReLU to create bends','Add/remove hidden neurons','Train and watch loss','Trace error responsibility backward'],
      baseline:'Compare the neural network with a simple linear classifier. Complexity is justified only if the simpler boundary cannot capture the sensor pattern.',
      expected:'A small MLP should classify the three synthetic machine states well; changing hidden units or learning rate should change training behavior.',
      environment:'CPU works for this tiny network. GPU is optional, not required.',
      challenge:'Use too few hidden neurons, then more than needed. Compare unseen performance and explain why more capacity is not automatically better.',
      real:['More neurons mean more capacity, not guaranteed improvement.','Training loss is not the same as real-world usefulness.','Backpropagation computes responsibility; Gradient Descent decides the update step.'],
      code:`# MODEL 7 — Sensor-fusion neural network
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

rng = np.random.default_rng(8)
normal = rng.normal([18, 58, 1.3], [3, 4, .35], (350, 3))
overload = rng.normal([34, 82, 4.4], [4, 5, .8], (300, 3))
unbalanced = rng.normal([21, 66, 6.0], [3, 5, .7], (300, 3))
X = np.vstack([normal, overload, unbalanced]); y = np.array([0]*350+[1]*300+[2]*300)
Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=.25, random_state=42, stratify=y)
scaler = StandardScaler(); Xtr = scaler.fit_transform(Xtr); Xte = scaler.transform(Xte)

baseline = LogisticRegression(max_iter=500).fit(Xtr, ytr)
print('Linear baseline:', round(baseline.score(Xte, yte), 3))

model = tf.keras.Sequential([
    tf.keras.layers.Input(shape=(3,)),
    tf.keras.layers.Dense(8, activation='relu'),
    tf.keras.layers.Dense(8, activation='relu'),
    tf.keras.layers.Dense(3, activation='softmax')
])
model.compile(optimizer=tf.keras.optimizers.Adam(0.01), loss='sparse_categorical_crossentropy', metrics=['accuracy'])
model.fit(Xtr, ytr, validation_split=.2, epochs=30, batch_size=32, verbose=0)
print('MLP test accuracy:', round(model.evaluate(Xte, yte, verbose=0)[1], 3))`
    },
    {
      id:8, stage:'NEURAL NETWORKS', title:'The New-Batch Test', subtitle:'Generalization + Regularization', difficulty:3, time:'65–85 min',
      hook:'The training score looks excellent. Why can the same model fail when a new supplier or production batch arrives?',
      goal:'Make generalization, overfitting, regularization and distribution shift visible as different problems rather than vocabulary definitions.',
      prerequisites:['Train vs unseen data','Model 7: weights and capacity','Model 4: overfitting intuition'],
      concepts:['training data','validation data','test data','generalization','overfitting','underfitting','regularization','early stopping','distribution shift'],
      missions:['Compare train vs unseen performance','Increase model complexity','Add regularization','Stop training when validation stops improving','Shift the new batch','Diagnose overfitting vs world-change'],
      baseline:'A simple model that generalizes can be preferable to a complex model that memorizes the old batch.',
      expected:'Training performance can keep improving while validation/new-batch performance stops improving or falls.',
      environment:'CPU is enough for the small demonstration. TensorFlow is available in standard Colab runtimes.',
      challenge:'Create one case of overfitting and one case of distribution shift. Explain why they may look similar in a metric but require different fixes.',
      real:['Overfitting means the model learned quirks of old examples; distribution shift means the world changed.','Regularization cannot repair missing future operating conditions.','Test data stops being a fair test if repeatedly used for tuning.'],
      code:`# MODEL 8 — Generalization on a shifted production batch
import numpy as np
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

rng = np.random.default_rng(18)
X_old = rng.normal([0, 0], [1, 1], (700, 2))
y_old = ((X_old[:,0]**2 + .7*X_old[:,1]) > .8).astype(int)
X_new = rng.normal([.55, -.25], [1.15, .9], (350, 2))  # supplier/process shift
y_new = ((X_new[:,0]**2 + .7*X_new[:,1]) > .8).astype(int)

for alpha in [0.00001, 0.01, 1.0]:
    model = make_pipeline(StandardScaler(), MLPClassifier(hidden_layer_sizes=(80,80), alpha=alpha, max_iter=700, random_state=42))
    model.fit(X_old, y_old)
    print('alpha', alpha, 'old batch', round(model.score(X_old,y_old),3), 'new batch', round(model.score(X_new,y_new),3))`
    },
    {
      id:9, stage:'NEURAL NETWORKS', title:'Surface Defect Vision', subtitle:'CNN', difficulty:4, time:'85–110 min',
      hook:'A camera image contains thousands of numbers. Why should nearby pixels be treated differently from unrelated columns in a table?',
      goal:'Build convolution from the need to preserve local spatial structure, then show filters, feature maps and pooling with manufactured-surface examples.',
      prerequisites:['Model 7: neuron/layer/activation','2D grid coordinates','Small matrix multiplication bridge'],
      concepts:['pixel','image channel','local patch','filter / kernel','convolution','feature map','stride','pooling','augmentation','CNN'],
      missions:['Zoom from image to pixel numbers','Apply one 3x3 filter by hand','Slide the same filter','See a feature map form','Pool a small region','Train a tiny defect CNN'],
      baseline:'Compare the CNN with a naive flattened-pixel classifier or chance accuracy before claiming spatial structure helped.',
      expected:'The synthetic scratch/pit patterns are intentionally simple, so a tiny CNN should learn them quickly; the point is the mechanism, not benchmark performance.',
      environment:'CPU works but GPU is faster. In Colab: Runtime → Change runtime type → select a GPU if available.',
      challenge:'Train on perfectly clean synthetic defects, then add noise/brightness variation and compare robustness before and after augmentation.',
      real:['Factory lighting and camera position can shift after deployment.','A CNN can learn background shortcuts instead of the defect.','Augmentation should mimic plausible variation, not random distortion.'],
      code:`# MODEL 9 — Self-contained synthetic surface-defect CNN
import numpy as np
import tensorflow as tf

rng = np.random.default_rng(9)
imgs=[]; labels=[]
for label in range(3):  # 0 clean, 1 scratch, 2 pit
    for _ in range(180):
        im = rng.normal(0.05, 0.02, (32,32,1)).astype('float32')
        if label == 1:
            row = rng.integers(8,24); im[row:row+2, 5:27, 0] += .8
        if label == 2:
            cy,cx = rng.integers(9,23,2); yy,xx=np.ogrid[:32,:32]; im[((yy-cy)**2+(xx-cx)**2)<16,0] += .8
        imgs.append(np.clip(im,0,1)); labels.append(label)
X=np.array(imgs); y=np.array(labels); idx=rng.permutation(len(y)); X,y=X[idx],y[idx]
cut=int(.8*len(y)); Xtr,Xte=X[:cut],X[cut:]; ytr,yte=y[:cut],y[cut:]
print('Chance baseline:', round(1/3,3))
model=tf.keras.Sequential([tf.keras.layers.Input((32,32,1)),tf.keras.layers.Conv2D(8,3,activation='relu'),tf.keras.layers.MaxPooling2D(),tf.keras.layers.Conv2D(16,3,activation='relu'),tf.keras.layers.GlobalAveragePooling2D(),tf.keras.layers.Dense(3,activation='softmax')])
model.compile(optimizer='adam',loss='sparse_categorical_crossentropy',metrics=['accuracy'])
model.fit(Xtr,ytr,epochs=5,batch_size=32,verbose=0)
print('CNN test accuracy:', round(model.evaluate(Xte,yte,verbose=0)[1],3))`
    },
    {
      id:10, stage:'NEURAL NETWORKS', title:'Energy Forecast', subtitle:'RNN / LSTM', difficulty:4, time:'80–105 min',
      hook:'Two machines can have the same current power reading but completely different recent histories. Why should the past change the next prediction?',
      goal:'Create sequence memory from the need to preserve ordered history before introducing recurrent state and LSTM gates.',
      prerequisites:['Model 7: neural network training','Model 8: leakage','Time order and simple sequences'],
      concepts:['sequence','timestep','window','hidden state','recurrence','long-term dependency','LSTM','forget gate','input gate','time split'],
      missions:['Compare identical current values with different histories','Build a history window','Keep a running state','See long information fade','Use gates to keep/forget','Forecast without future leakage'],
      baseline:'Tomorrow-equals-today is the first forecasting baseline. An LSTM must beat that simple rule on unseen future points to justify itself.',
      expected:'On the synthetic smooth power signal, the LSTM should usually beat or approach the persistence baseline after a few epochs.',
      environment:'CPU works; GPU is faster. In Colab: Runtime → Change runtime type → GPU if available.',
      challenge:'Change history length from very short to long. Explain when extra history helps and when it simply adds noise or cost.',
      real:['Random train/test splitting can leak future information into time-series evaluation.','Long windows are not automatically better.','A recurrent model cannot remember information that never enters its input window.'],
      code:`# MODEL 10 — Machine energy forecasting with an LSTM
import numpy as np
import tensorflow as tf

rng=np.random.default_rng(10)
t=np.arange(900)
power=40 + 4*np.sin(t/22) + 2*np.sin(t/7) + .015*t + rng.normal(0,.45,len(t))
window=24
X=[]; y=[]
for i in range(window,len(power)):
    X.append(power[i-window:i]); y.append(power[i])
X=np.array(X)[...,None].astype('float32'); y=np.array(y).astype('float32')
cut=int(.8*len(y)); Xtr,Xte=X[:cut],X[cut:]; ytr,yte=y[:cut],y[cut:]
persistence=Xte[:,-1,0]
print('Persistence MAE:', round(np.mean(np.abs(persistence-yte)),3))
model=tf.keras.Sequential([tf.keras.layers.Input((window,1)),tf.keras.layers.LSTM(16),tf.keras.layers.Dense(1)])
model.compile(optimizer='adam',loss='mae')
model.fit(Xtr,ytr,epochs=8,batch_size=32,verbose=0)
pred=model.predict(Xte,verbose=0).ravel()
print('LSTM MAE:', round(np.mean(np.abs(pred-yte)),3))`
    },
    {
      id:11, stage:'MODERN AI', title:'Maintenance Notes Reader', subtitle:'Transformer', difficulty:4, time:'90–120 min',
      hook:'In “motor hot after bearing replacement,” how can a model know which words should influence the meaning of “hot” and “bearing”?',
      goal:'Build tokens, embeddings and attention from the need for numerical text representations whose meaning changes with context.',
      prerequisites:['Model 7: weights and matrix idea','Vector similarity bridge','Softmax intuition'],
      concepts:['token','token id','embedding','context','attention','query','key','value','attention head','positional information','Transformer'],
      missions:['Turn a maintenance sentence into tokens','See why IDs do not encode meaning','Map tokens to vectors','Compute tiny attention scores','Visualize context links','Inspect a pretrained attention matrix'],
      baseline:'Compare contextual representations with plain keyword matching. The Transformer is useful because the same word can be interpreted differently in different sentences.',
      expected:'The exact attention values vary by model/head; the learning target is to inspect which tokens receive weight, not to expect a single “correct” attention map.',
      environment:'CPU works for the tiny inspection. The first run downloads a pretrained model, so internet access is required.',
      challenge:'Change one maintenance sentence while keeping the word “bearing.” Inspect how token context changes and explain why attention is contextual rather than a fixed dictionary.',
      real:['Attention weights are not proof of human-style reasoning.','Tokenization can split technical terms unexpectedly.','Pretrained language models can misunderstand specialized maintenance vocabulary.'],
      code:`# MODEL 11 — Inspect Transformer attention on a maintenance note
# In a fresh Colab, run once if needed: !pip -q install transformers
import torch
from transformers import AutoTokenizer, AutoModel

name='distilbert-base-uncased'
tok=AutoTokenizer.from_pretrained(name)
model=AutoModel.from_pretrained(name, output_attentions=True)
text='motor hot after bearing replacement; noise increases under load'
inputs=tok(text, return_tensors='pt')
with torch.no_grad():
    out=model(**inputs)
tokens=tok.convert_ids_to_tokens(inputs['input_ids'][0])
# Last layer, first head, attention FROM each token TO each token.
a=out.attentions[-1][0,0]
focus=tokens.index('hot')
top=torch.topk(a[focus], k=min(5,len(tokens)))
print('Focus token:', tokens[focus])
for score,idx in zip(top.values,top.indices):
    print(tokens[int(idx)], round(float(score),3))`
    },
    {
      id:12, stage:'MODERN AI', title:'Technician Report Adapter', subtitle:'LoRA', difficulty:5, time:'100–135 min',
      hook:'A pretrained language model understands general text, but our company needs a specific maintenance-report format. Do we need to retrain everything?',
      goal:'Create parameter-efficient adaptation from the cost of full fine-tuning before introducing low-rank adapters and quantization.',
      prerequisites:['Model 11: Transformer weights','Model 7: training parameters','Matrix rank visual bridge'],
      concepts:['pretrained model','fine-tuning','frozen weight','adapter','low rank','LoRA','rank','trainable parameter','quantization'],
      missions:['Compare training all weights vs a tiny adapter','See frozen vs trainable parameters','Change rank','Estimate trainable parameter count','Format maintenance notes','Separate behavior adaptation from factual knowledge'],
      baseline:'First prompt the pretrained model without adaptation. LoRA is justified only if the small adapter reliably improves the required behavior/format.',
      expected:'Trainable parameters should be only a small fraction of the base model. Tiny models may still produce clumsy text; the lesson is adaptation mechanics.',
      environment:'Internet is required for the pretrained model. GPU is recommended. In Colab: Runtime → Change runtime type → GPU. Use the version cell shown in Base Camp if APIs differ.',
      challenge:'Change LoRA rank and compare trainable parameter count before changing any other setting. Explain the capacity/memory tradeoff.',
      real:['Fine-tuning behavior does not automatically add reliable current facts.','Higher rank is not automatically better.','Fast-moving Transformers/PEFT APIs require version awareness.'],
      code:`# MODEL 12 — LoRA mechanics on a tiny language model
# Fresh Colab: !pip -q install transformers peft
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig, get_peft_model, TaskType

name='sshleifer/tiny-gpt2'
tok=AutoTokenizer.from_pretrained(name)
base=AutoModelForCausalLM.from_pretrained(name)
config=LoraConfig(task_type=TaskType.CAUSAL_LM, r=8, lora_alpha=16, lora_dropout=.05, target_modules=['c_attn'])
model=get_peft_model(base, config)
model.print_trainable_parameters()

text='Technician note: motor hot after bearing replacement.\nReport:\nComponent:'
inputs=tok(text, return_tensors='pt')
out=model.generate(**inputs, max_new_tokens=30, do_sample=False)
print(tok.decode(out[0], skip_special_tokens=True))
print('\nThis tiny model is used to inspect LoRA mechanics, not as a quality benchmark.')`
    },
    {
      id:13, stage:'MODERN AI', title:'Engineering Copilot', subtitle:'RAG + Tool Use', difficulty:5, time:'105–140 min',
      hook:'A general model does not know our newest manual or service bulletin. How can it answer from current evidence instead of guessing?',
      goal:'Build retrieval, chunking, embeddings, Top-K, grounding and tool use from the need for current/private knowledge.',
      prerequisites:['Model 11: embeddings','Similarity and Top-K','Model 8: evaluation discipline','Basic function/tool idea'],
      concepts:['document','chunk','embedding','similarity search','Top-K','retrieval','context','grounding','citation','hallucination','tool call','RAG'],
      missions:['Split engineering notes into chunks','Embed question and chunks','Retrieve Top-K evidence','Inspect evidence before generation','Answer with citations','Call a calculator tool','Break retrieval and diagnose it'],
      baseline:'Ask without retrieval first. The capstone succeeds when the correct evidence is retrieved and cited; fluent generation is secondary.',
      expected:'The correct bearing-maintenance chunk should rank near the top for a bearing-temperature question. Inspect retrieval before judging the final wording.',
      environment:'CPU is enough for retrieval with a small embedding model, but the first run downloads it. Generation is optional so weak free models cannot hide successful retrieval.',
      challenge:'Change chunk size and Top-K until irrelevant context appears. Diagnose the retrieval failure before changing the generator.',
      real:['Bad retrieval gives the generator bad evidence.','More context can reduce quality when irrelevant chunks crowd the prompt.','Retrieved documents are data, not trusted instructions; prompt injection must be treated as untrusted content.'],
      code:`# MODEL 13 — Engineering RAG: retrieval quality first, generation optional
# Fresh Colab: !pip -q install sentence-transformers
from sentence_transformers import SentenceTransformer
import numpy as np

docs=[
 'Bearing service bulletin: if housing temperature exceeds 85 C, inspect lubrication and alignment before restart.',
 'Motor commissioning: verify phase rotation and record no-load current before coupling.',
 'Pump SOP: isolate pressure and apply lockout-tagout before opening the casing.',
 'Bearing replacement record: use the specified grease quantity; over-greasing can increase temperature.'
]
question='What should I inspect when a bearing housing is above 85 C?'
embedder=SentenceTransformer('all-MiniLM-L6-v2')
D=embedder.encode(docs, normalize_embeddings=True)
q=embedder.encode([question], normalize_embeddings=True)[0]
scores=D @ q
order=np.argsort(scores)[::-1]
print('QUESTION:', question)
print('\nRetrieved evidence:')
for rank,i in enumerate(order[:3],1):
    print(rank, 'score', round(float(scores[i]),3), '-', docs[i])

# Grounded first answer: use the retrieved evidence directly.
best=docs[order[0]]
print('\nGrounded answer:', best)
print('Source: chunk', int(order[0])+1)
print('\nOnly after retrieval looks correct should you add a language generator.')`
    }
  ];

  const sources = {
    1:[['Official','scikit-learn LinearRegression','https://scikit-learn.org/stable/modules/linear_model.html#ordinary-least-squares']],
    2:[['Official','scikit-learn Logistic Regression','https://scikit-learn.org/stable/modules/linear_model.html#logistic-regression']],
    3:[['Official','Nearest Neighbors','https://scikit-learn.org/stable/modules/neighbors.html'],['Official','Support Vector Machines','https://scikit-learn.org/stable/modules/svm.html']],
    4:[['Official','Decision Trees','https://scikit-learn.org/stable/modules/tree.html']],
    5:[['Official','Ensemble methods','https://scikit-learn.org/stable/modules/ensemble.html'],['Official','Common pitfalls','https://scikit-learn.org/stable/common_pitfalls.html']],
    6:[['Official','K-Means','https://scikit-learn.org/stable/modules/clustering.html#k-means'],['Official','PCA','https://scikit-learn.org/stable/modules/decomposition.html#pca']],
    7:[['Official','Keras Sequential model','https://keras.io/guides/sequential_model/']],
    8:[['Official','scikit-learn common pitfalls','https://scikit-learn.org/stable/common_pitfalls.html']],
    9:[['Official','Keras Conv2D','https://keras.io/api/layers/convolution_layers/convolution2d/']],
    10:[['Official','Keras LSTM','https://keras.io/api/layers/recurrent_layers/lstm/']],
    11:[['Official','Hugging Face Transformers','https://huggingface.co/docs/transformers/index']],
    12:[['Official','Hugging Face PEFT','https://huggingface.co/docs/peft/index']],
    13:[['Official','Sentence Transformers semantic search','https://www.sbert.net/examples/sentence_transformer/applications/semantic-search/README.html']]
  };

  C.forEach(x => { x.sources = sources[x.id] || []; });
  globalThis.MQ_CURRICULUM = C;

  // Keep the legacy global array synchronized until the old renderer is retired.
  if (typeof PROJECTS !== 'undefined') {
    C.forEach(item => {
      const old = PROJECTS.find(p => p.id === item.id);
      if (old) Object.assign(old, item);
    });
  }
})();
