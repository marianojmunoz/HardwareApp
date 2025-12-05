
return results;
}

// Run the script
checkAllImageUrls()
    .then(() => {
        console.log('✅ Check completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    });
