const fs = require('fs');
const { writeFileSync } = require('fs');
const Papa = require('papaparse');
const { DecisionTreeClassifier } = require('ml-cart');
//const { RandomForestClassifier } = require('ml-random-forest');
//const KNN = require('ml-knn');
//const { GaussianNB } = require('ml-naivebayes');
const { Matrix } = require('ml-matrix');

// Function to save the model
const saveModel = (model, targetMap, filePath) => {
  const modelState = {
    model: model.toJSON(),
    targetMap: targetMap
  };
  writeFileSync(filePath, JSON.stringify(modelState));
};

// Function to convert CSV to JSON
const csvToJson = (csvString) => {
  const jsonArray = [];
  const parseResult = Papa.parse(csvString, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  if (parseResult.data) {
    parseResult.data.forEach((row) => {
      jsonArray.push(row);
    });
  }

  return jsonArray;
};

// Function to load dataset from a CSV file
const loadDataset = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(csvToJson(data));
      }
    });
  });
};

// Function to split dataset into features and labels
const splitDataset = (data) => {
  const features = data.map((row) => {
    // Destructure to exclude certain features
    const { target, time, 'sound#mean': _, 'sound#min': __, 'sound#max': ___, 'sound#std': ____, ...rest } = row;
    return Object.values(rest);
  });

  const labels = data.map((row) => row.target);
  return { features, labels };
};

// Function to calculate accuracy
const calculateAccuracy = (trueLabels, predictions) => {
  let correct = 0;
  trueLabels.forEach((label, index) => {
    if (label === predictions[index]) {
      correct += 1;
    }
  });
  return correct / trueLabels.length;
};

// Function to shuffle and split the dataset into training and test sets 
const splitIntoTrainingAndTestSets = (data, testSize = 0.3) => {
  const shuffledData = data.sort(() => 0.5 - Math.random()); 
  const testSetSize = Math.floor(shuffledData.length * testSize);
  const testSet = shuffledData.slice(0, testSetSize);
  const trainingSet = shuffledData.slice(testSetSize);
  return { trainingSet, testSet };
};

// Function to encode categorical target values to numeric
const encodeTargets = (data) => {
  const uniqueTargets = [...new Set(data.map((item) => item.target))];
  const targetMap = uniqueTargets.reduce((acc, cur, index) => {
    acc[cur] = index;
    return acc;
  }, {});

  const encodedData = data.map((item) => ({
    ...item,
    target: targetMap[item.target],
  }));

  return { encodedData, targetMap }; 
};

// Ensure that the newData matches the training data format
const newData = {
  'android.sensor.accelerometer#mean': 9.9,
  'android.sensor.accelerometer#min': 6.7,
  'android.sensor.accelerometer#max': 15.5,
  'android.sensor.accelerometer#std': 2.8,
  'android.sensor.gyroscope#mean': 1.83,
  'android.sensor.gyroscope#min': 0.32,
  'android.sensor.gyroscope#max': 3.51,
  'android.sensor.gyroscope#std': 1.06,
};


const predictModeOfTransport = (classifier, targetMap, dataPoint) => {
  // Prepare the data point for prediction by removing excluded features
  const featuresForPrediction = {
    'android.sensor.accelerometer#mean': dataPoint['android.sensor.accelerometer#mean'],
    'android.sensor.accelerometer#min': dataPoint['android.sensor.accelerometer#min'],
    'android.sensor.accelerometer#max': dataPoint['android.sensor.accelerometer#max'],
    'android.sensor.accelerometer#std': dataPoint['android.sensor.accelerometer#std'],
    'android.sensor.gyroscope#mean': dataPoint['android.sensor.gyroscope#mean'],
    'android.sensor.gyroscope#min': dataPoint['android.sensor.gyroscope#min'],
    'android.sensor.gyroscope#max': dataPoint['android.sensor.gyroscope#max'],
    'android.sensor.gyroscope#std': dataPoint['android.sensor.gyroscope#std'],
    // 'sound#mean': dataPoint['sound#mean'], // Excluded
    // 'sound#min': dataPoint['sound#min'],   // Excluded
    // 'sound#max': dataPoint['sound#max'],   // Excluded
    // 'sound#std': dataPoint['sound#std'],   // Excluded
  };

  // Convert the new data point to the format expected by the classifier (array of values)
  const input = new Matrix([Object.values(featuresForPrediction)]);
  const prediction = classifier.predict(input);

  // Find the mode of transport from the targetMap using the prediction
  const target = Object.keys(targetMap).find(key => targetMap[key] === prediction[0]);
  return target;
};

// Main function to load the data, train the model, and evaluate it
const main = async () => {
  try {
    // where the path of dataset csv is added
    const dataPath = 'C:\\...\\dataset.csv';

    // Load the data
    let rawData = await loadDataset(dataPath);

    // Encode the target variable
    const { encodedData, targetMap } = encodeTargets(rawData); 

    // Split the data into training and test sets
    const { trainingSet, testSet } = splitIntoTrainingAndTestSets(encodedData);

    const { features: trainingFeatures, labels: trainingLabels } = splitDataset(trainingSet);
    const { features: testFeatures, labels: testLabels } = splitDataset(testSet);

    // Train the CART Alg Decision Tree classifier
    const classifier = new DecisionTreeClassifier();
    classifier.train(new Matrix(trainingFeatures), trainingLabels);

    // Predict the test set
    const predictions = classifier.predict(new Matrix(testFeatures));

    // Evaluate the accuracy
    const accuracy = calculateAccuracy(testLabels, predictions);
    console.log(`Accuracy: ${accuracy}`);

    // Train the Naive Bayes classifier
    /*
    const naiveBayesClassifier = new GaussianNB();
    naiveBayesClassifier.train(trainingFeatures, trainingLabels);
    const nbPredictions = naiveBayesClassifier.predict(testFeatures);
    const nbAccuracy = calculateAccuracy(testLabels, nbPredictions);
    console.log(`Naive Bayes Accuracy: ${nbAccuracy}`);
    */

    // Train the KNN classifier
    /*
    const knnClassifier = new KNN(trainingFeatures, trainingLabels, { k: 5 }); // 'k' can be adjusted
    const knnPredictions = knnClassifier.predict(testFeatures);
    const knnAccuracy = calculateAccuracy(testLabels, knnPredictions);
    console.log(`KNN Accuracy: ${knnAccuracy}`);
    */

    // Train the Random Forest Classifier
    /*
    const randomForestClassifier = new RandomForestClassifier({
      numberOfTrees: 100 
    });
    randomForestClassifier.train(new Matrix(trainingFeatures), trainingLabels)

    // Predict the test set with Random Forest
    const rfPredictions = randomForestClassifier.predict(new Matrix(testFeatures));
    const rfAccuracy = calculateAccuracy(testLabels, rfPredictions);
    console.log(`Random Forest Accuracy: ${rfAccuracy}`);
    */

    saveModel(classifier, targetMap, 'C:\\...\\model.json');

    const modeOfTransport = predictModeOfTransport(classifier, targetMap, newData);
    console.log(`Predicted mode of transport: ${modeOfTransport}`);
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

main();
