import fs from 'fs';
import File from '../models/file.js'; // Add this import if not already included

// ... (existing imports)

export const uploadImage = async (request, response) => {
    const fileObj = {
        path: request.file.path,
        name: request.file.originalname,
    }

    try {
        const file = await File.create(fileObj);

        // Set a timeout to delete the file after 30 minutes
        setTimeout(async () => {
            // Delete the file from the "uploads" directory
            fs.unlink(file.path, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                } else {
                    console.log('File deleted successfully');
                }
            });

            // Remove the file entry from the database
            File.findByIdAndDelete(file._id, (err) => {
                if (err) {
                    console.error('Error deleting file entry from the database:', err);
                } else {
                    console.log('File entry deleted from the database');
                }
            });
        }, 30 * 60 * 1000); // 30 minutes in milliseconds

        response.status(200).json({ path: `https://file-sharingbackend.onrender.com/file/${file._id}` });
    } catch (error) {
        console.error(error.message);
        response.status(500).json({ error: error.message });
    }
}

export const getImage = async (request, response) => {
    try {
        const file = await File.findById(request.params.fileId);

        file.downloadCount++;

        await file.save();

        response.download(file.path, file.name);
    } catch (error) {
        console.error(error.message);
        response.status(500).json({ msg: error.message });
    }
}
