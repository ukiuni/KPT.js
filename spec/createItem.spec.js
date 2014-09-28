var server = require("../kpt.js");
var webdriver = require('selenium-webdriver');
jasmine.getEnv().defaultTimeoutInterval = 10000;
var oldCallback = jasmine.getEnv().currentRunner().finishCallback;
jasmine.getEnv().currentRunner().finishCallback = function() {
	oldCallback.call(this);
	server.close();
	process.exit(0);
}

describe("Keep to be created", function() {
	it("one keep item created", function(done) {
		createItem('Test Project', 'createKeepButton', 'This is Keep', function() {
			done();
		});
	});
	it("one problem item created", function(done) {
		createItem('Test Project', 'createProblemButton', 'This is Problem', function() {
			done();
		});
	});
	it("one try item created", function(done) {
		createItem('Test Project', 'createTryButton', 'This is Try', function() {
			done();
		});
	});
});
function createItem(projectName, createItemButtonId, inputText, callback) {
	var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();
	driver.get('http://localhost:3000');
	driver.wait(function() {
		return driver.getTitle().then(function(title) {
			return title === "KPT";
		});
	}, 1000);
	driver.findElement(webdriver.By.id('projectNameInput')).sendKeys(projectName);
	driver.findElement(webdriver.By.id('createProjectButton')).click();

	driver.wait(function() {
		return driver.getTitle().then(function(title) {
			return title === projectName;
		});
	}, 10000);

	driver.findElement(webdriver.By.id(createItemButtonId)).click();
	driver.wait(function() {
		return driver.isElementPresent(webdriver.By.id('itemInputTextArea'));
	}, 10000);

	driver.findElement(webdriver.By.id('itemInputTextArea')).sendKeys(inputText);
	driver.findElement(webdriver.By.id('saveButton')).click();
	driver.wait(function() {
		return driver.isElementPresent(webdriver.By.className('item'));
	}, 10000);
	driver.findElement(webdriver.By.className('item')).then(function(element) {
		element.getText().then(function(text) {
			expect(inputText).toEqual(text);
		});
	});
	driver.quit().then(function() {
		callback();
	});
}
