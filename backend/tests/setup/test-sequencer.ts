const Sequencer = require("@jest/test-sequencer").default;

class CustomSequencer extends Sequencer {
  sort(tests: any[]) {
    // Run tests in specific order to avoid conflicts
    const order = [
      "unit", // Unit tests first (fastest)
      "integration", // Integration tests second
      "e2e", // End-to-end tests third
      "load", // Load tests fourth
      "security", // Security tests last
    ];

    return tests.sort((testA: any, testB: any) => {
      const aOrder = order.findIndex((type) => testA.path.includes(type));
      const bOrder = order.findIndex((type) => testB.path.includes(type));

      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }

      return testA.path.localeCompare(testB.path);
    });
  }
}

module.exports = CustomSequencer;
