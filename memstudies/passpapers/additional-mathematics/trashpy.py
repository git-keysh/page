import os
import requests
from urllib.parse import unquote

# List of URLs for Additional Mathematics
urls = [
    "https://api.caribbeans.ai/past_papers/csec/Additional%20Mathematics/Paper%202/CSEC_Additional_Mathematics_P2_2024_MJ.pdf",
    "https://api.caribbeans.ai/past_papers/csec/Additional%20Mathematics/Paper%202/CSEC_Additional_Mathematics_P2_2023_MJ.pdf",
    "https://api.caribbeans.ai/past_papers/csec/Additional%20Mathematics/Paper%202/CSEC_Additional_Mathematics_P2_2022_MJ.pdf",
    "https://api.caribbeans.ai/past_papers/csec/Additional%20Mathematics/Paper%202/CSEC_Additional_Mathematics_P2_2021_MJ.pdf",
    "https://api.caribbeans.ai/past_papers/csec/Additional%20Mathematics/Paper%202/CSEC_Additional_Mathematics_P2_2019_MJ.pdf",
    "https://api.caribbeans.ai/past_papers/csec/Additional%20Mathematics/Paper%202/CSEC_Additional_Mathematics_P2_2018_MJ.pdf",
    "https://api.caribbeans.ai/past_papers/csec/Additional%20Mathematics/Paper%202/CSEC_Additional_Mathematics_P2_2017_MJ.pdf",
]

def format_filename(url):
    """Extract and format the filename from URL"""
    # Decode URL and get the filename
    decoded_url = unquote(url)
    filename = os.path.basename(decoded_url)
    
    # Remove the _MJ part
    filename = filename.replace('_MJ', '')
    
    # Replace underscores with spaces
    filename = filename.replace('_', ' ')
    
    # Remove the .pdf extension temporarily, capitalize, then add back
    name_without_ext = filename.replace('.pdf', '')
    formatted_name = name_without_ext.upper()
    filename = f"{formatted_name}.pdf"
    
    return filename

def download_pdf(url, save_path):
    """Download a PDF file"""
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        # Save the file
        with open(save_path, 'wb') as file:
            for chunk in response.iter_content(chunk_size=8192):
                file.write(chunk)
        
        print(f"✓ Downloaded: {os.path.basename(save_path)}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"✗ Failed to download {url}: {e}")
        return False

def main():
    # Create the target directory (same as before)
    target_dir = os.path.join('memstudies', 'passpapers', 'integrated-science')
    os.makedirs(target_dir, exist_ok=True)
    
    print(f"Saving files to: {target_dir}\n")
    
    # Download each PDF
    success_count = 0
    for url in urls:
        # Format the filename
        filename = format_filename(url)
        
        # Create full path
        save_path = os.path.join(target_dir, filename)
        
        # Check if file already exists
        if os.path.exists(save_path):
            print(f"⏭ Skipping (already exists): {filename}")
            continue
        
        # Download the file
        if download_pdf(url, save_path):
            success_count += 1
    
    print(f"\n{'='*50}")
    print(f"Download complete! {success_count}/{len(urls)} files downloaded.")
    print(f"Files saved in: {target_dir}")

if __name__ == "__main__":
    main()