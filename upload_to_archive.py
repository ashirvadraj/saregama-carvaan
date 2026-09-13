import os
import sys
import json
import time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import internetarchive as ia
from tqdm import tqdm

ACCESS_KEY = 'RWNF8TM2jBQ7BKWX'
SECRET_KEY = 'Vp6NZ6ZD5IkKGzwS'
IDENTIFIER = 'saregama-carvaan-5000-songs-collection'
CARVAAN_DIR = r'I:\carvaan'
MAX_WORKERS = 4

session = ia.get_session(config={'s3': {'access': ACCESS_KEY, 'secret': SECRET_KEY}})

item_metadata = {
    'collection': 'opensource_audio',
    'title': 'Saregama Carvaan 5000 Classic Bollywood Songs & Binaca Geetmala Collection',
    'mediatype': 'audio',
    'creator': 'Saregama / Ameen Sayani',
    'subject': ['hindi music', 'bollywood classics', 'geetmala', 'ameen sayani', 'carvaan'],
    'description': 'Complete vintage Saregama Carvaan 5000 songs collection with Ameen Sayani Binaca Geetmala countdowns and artist discographies.'
}

def scan_files():
    files_to_upload = []
    for root, _, files in os.walk(CARVAAN_DIR):
        for f in sorted(files):
            if f.lower().endswith(('.mp3', '.m4a', '.flac', '.wav', '.lrc')):
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, CARVAAN_DIR).replace('\\', '/')
                files_to_upload.append((full_path, rel_path))
    return files_to_upload

def upload_single_file(file_tuple):
    full_path, rel_path = file_tuple
    try:
        session.upload(
            IDENTIFIER,
            files={rel_path: full_path},
            metadata=item_metadata,
            verbose=False,
            queue_derive=False,
            verify=False
        )
        return True, rel_path
    except Exception as e:
        return False, (rel_path, str(e))

def main():
    print('Scanning Carvaan files from ' + CARVAAN_DIR + '...')
    files = scan_files()
    total = len(files)
    print(f'Total files found: {total}')

    print(f'Starting upload to Archive.org under item: {IDENTIFIER}')
    print(f'Direct Cloud Streaming Base URL: https://archive.org/download/{IDENTIFIER}/')

    uploaded = 0
    failed = []

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(upload_single_file, f): f for f in files}
        with tqdm(total=total, desc='Uploading to Archive.org', unit='file') as pbar:
            for future in as_completed(futures):
                success, result = future.result()
                if success:
                    uploaded += 1
                else:
                    failed.append(result)
                pbar.update(1)

    print(f'Upload completed! Successfully uploaded: {uploaded}/{total}')
    if failed:
        print(f'Failed: {len(failed)} files.')

if __name__ == '__main__':
    main()
