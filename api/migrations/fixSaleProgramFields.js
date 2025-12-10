const SaleProgram = require('../models/saleProgram.models');

/**
 * Migration to fix legacy sale programs with stringified JSON fields
 * Converts string fields to proper objects for: benefits, conditions, displaySettings
 */
const fixSaleProgramStringFields = async () => {
    try {
        console.log('Starting sale program field migration...');

        // Use .lean() to get plain objects and avoid Mongoose init errors
        const programs = await SaleProgram.find({}).lean();

        let fixedCount = 0;
        let unchangedCount = 0;
        let errorCount = 0;
        const errors = [];

        for (const program of programs) {
            let needsUpdate = false;
            const updates = {};

            // Check and parse benefits
            if (typeof program.benefits === 'string') {
                try {
                    updates.benefits = JSON.parse(program.benefits);
                    needsUpdate = true;
                } catch (e) {
                    errors.push({
                        id: program._id,
                        field: 'benefits',
                        error: e.message
                    });
                    errorCount++;
                }
            }

            // Check and parse conditions
            if (typeof program.conditions === 'string') {
                try {
                    updates.conditions = JSON.parse(program.conditions);
                    needsUpdate = true;
                } catch (e) {
                    errors.push({
                        id: program._id,
                        field: 'conditions',
                        error: e.message
                    });
                    errorCount++;
                }
            }

            // Check and parse displaySettings
            if (typeof program.displaySettings === 'string') {
                try {
                    updates.displaySettings = JSON.parse(program.displaySettings);
                    needsUpdate = true;
                } catch (e) {
                    errors.push({
                        id: program._id,
                        field: 'displaySettings',
                        error: e.message
                    });
                    errorCount++;
                }
            }

            // Check and parse targeting
            if (typeof program.targeting === 'string') {
                try {
                    updates.targeting = JSON.parse(program.targeting);
                    needsUpdate = true;
                } catch (e) {
                    errors.push({
                        id: program._id,
                        field: 'targeting',
                        error: e.message
                    });
                    errorCount++;
                }
            }

            // Update if needed
            if (needsUpdate) {
                try {
                    await SaleProgram.updateOne(
                        { _id: program._id },
                        { $set: updates }
                    );
                    fixedCount++;
                    console.log(`✓ Fixed program: ${program.title || program._id}`);
                } catch (e) {
                    errors.push({
                        id: program._id,
                        field: 'update',
                        error: e.message
                    });
                    errorCount++;
                }
            } else {
                unchangedCount++;
            }
        }

        const result = {
            total: programs.length,
            fixed: fixedCount,
            unchanged: unchangedCount,
            errors: errorCount,
            errorDetails: errors
        };

        console.log('\nMigration completed:');
        console.log(`Total programs: ${result.total}`);
        console.log(`Fixed: ${result.fixed}`);
        console.log(`Unchanged: ${result.unchanged}`);
        console.log(`Errors: ${result.errors}`);

        return result;
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
};

module.exports = {
    fixSaleProgramStringFields
};
