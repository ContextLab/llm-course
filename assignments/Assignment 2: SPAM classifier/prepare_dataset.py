import os
import shutil
import random
import zipfile
import sys

def prepare_email_dataset(data_dir, train_prop):
    # Step 1: Gather all the .txt files from ham and spam directories across subfolders
    ham_files = []
    spam_files = []

    for subfolder in os.listdir(data_dir):
        subfolder_path = os.path.join(data_dir, subfolder)
        ham_dir = os.path.join(subfolder_path, 'ham')
        spam_dir = os.path.join(subfolder_path, 'spam')

        if os.path.isdir(ham_dir) and os.path.isdir(spam_dir):
            ham_files.extend([os.path.join(ham_dir, f) for f in os.listdir(ham_dir) if f.endswith('.txt')])
            spam_files.extend([os.path.join(spam_dir, f) for f in os.listdir(spam_dir) if f.endswith('.txt')])

    n_ham = len(ham_files)
    n_spam = len(spam_files)
    n_total = n_ham + n_spam

    if n_total == 0:
        print("No .txt files found in the ham and spam directories.")
        return

    print(f"Found {n_ham} ham emails and {n_spam} spam emails, {n_total} total.")

    # Step 2: Randomly shuffle ham and spam files
    random.shuffle(ham_files)
    random.shuffle(spam_files)

    # Step 3: Determine the number of files for training and test sets
    train_count = int(train_prop * n_total)

    # For the test set, we need to ensure equal numbers of ham and spam emails
    test_count = n_total - train_count
    test_count_per_class = test_count // 2

    # Edge case handling if there aren't enough ham or spam emails to balance the test set
    test_ham_count = min(test_count_per_class, n_ham)
    test_spam_count = min(test_count_per_class, n_spam)

    # Adjust training count based on what's left after balancing test set
    train_ham_count = n_ham - test_ham_count
    train_spam_count = n_spam - test_spam_count

    print(f"Assigning {train_ham_count} ham and {train_spam_count} spam to the training set.")
    print(f"Assigning {test_ham_count} ham and {test_spam_count} spam to the test set.")

    # Step 4: Split the ham and spam emails into training and test sets
    train_files = ham_files[:train_ham_count] + spam_files[:train_spam_count]
    test_files = ham_files[train_ham_count:] + spam_files[train_spam_count:]

    # Step 5: Randomly assign unique numbers to each file in the combined dataset
    all_files = train_files + test_files
    random_numbers = random.sample(range(1, 1000000), len(all_files))

    file_mapping = {}
    for i, file in enumerate(all_files):
        new_filename = str(random_numbers[i]) + '.txt'
        file_mapping[file] = new_filename

    # Step 6: Create new directories for training and test sets
    training_dir = os.path.join(data_dir, 'training')
    test_dir = os.path.join(data_dir, 'test')
    
    os.makedirs(os.path.join(training_dir, 'ham'), exist_ok=True)
    os.makedirs(os.path.join(training_dir, 'spam'), exist_ok=True)
    os.makedirs(os.path.join(test_dir, 'ham'), exist_ok=True)
    os.makedirs(os.path.join(test_dir, 'spam'), exist_ok=True)

    # Step 7: Move and rename files to their new directories
    for file in train_files:
        subfolder = 'ham' if file in ham_files else 'spam'
        new_filename = file_mapping[file]
        shutil.move(file, os.path.join(training_dir, subfolder, new_filename))

    for file in test_files:
        subfolder = 'ham' if file in ham_files else 'spam'
        new_filename = file_mapping[file]
        shutil.move(file, os.path.join(test_dir, subfolder, new_filename))

    # Step 8: Remove .DS_Store files if they exist
    for root, dirs, files in os.walk(data_dir):
        for file in files:
            if file == '.DS_Store':
                os.remove(os.path.join(root, file))

    # Step 9: Create zip archives
    zip_dir(training_dir, os.path.join(data_dir, 'training.zip'))
    zip_dir(test_dir, os.path.join(data_dir, 'test.zip'))

    print(f"Training and test sets prepared successfully. Zipped to {data_dir}")

def zip_dir(folder_path, output_zip):
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, _, files in os.walk(folder_path):
            for file in files:
                zf.write(os.path.join(root, file),
                         os.path.relpath(os.path.join(root, file),
                                         os.path.join(folder_path, '..')))

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python prepare_email_dataset.py path/to/data/directory train_prop")
        sys.exit(1)

    data_dir = sys.argv[1]
    
    try:
        train_prop = float(sys.argv[2])
        if not (0 < train_prop < 1):
            raise ValueError
    except ValueError:
        print("Error: train_prop must be a float between 0 and 1.")
        sys.exit(1)

    prepare_email_dataset(data_dir, train_prop)
