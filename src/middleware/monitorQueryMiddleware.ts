import mongoose from "mongoose";

export const enableQueryLogging = () => {
  mongoose.set("debug", (collectionName, method, query, doc, options) => {
    const start = Date.now();

    // Wraping inside nextTick to wait until query finishes
    process.nextTick(() => {
      const duration = Date.now() - start;
      console.log(
        `[MongoDB Query] ${collectionName}.${method} took ${duration}ms`,
        "Query:",
        query,
        "Doc:",
        doc
        // "Options:",
        // options
      );
    });
  });
};
