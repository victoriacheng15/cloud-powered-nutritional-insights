from azure.storage.blob import BlobServiceClient
import pandas as pd
import io
import json
import os
from datetime import datetime

def process_nutritional_data_from_azurite():
    """
    Serverless function to process nutritional data from Azurite Blob Storage
    and store results in simulated NoSQL storage (JSON file).
    """
    # Azurite connection string with the correct account key
    connect_str = "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;" \
                  "AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;" \
                  "BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1"
    
    try:
        # Initialize blob service client
        blob_service_client = BlobServiceClient.from_connection_string(connect_str)
        
        container_name = 'datasets'
        blob_name = 'All_Diets.csv'
        
        # Get container and blob clients
        container_client = blob_service_client.get_container_client(container_name)
        blob_client = container_client.get_blob_client(blob_name)
        
        print(f"Downloading blob: {blob_name} from container: {container_name}")
        
        # Download blob content to bytes
        stream = blob_client.download_blob().readall()
        df = pd.read_csv(io.BytesIO(stream))
        
        print(f"Successfully loaded CSV with {len(df)} rows and {len(df.columns)} columns")
        print(f"Columns: {list(df.columns)}")
        
        # Calculate average nutritional values per diet type
        # Check if the expected columns exist
        required_cols = ['Diet_type', 'Protein(g)', 'Carbs(g)', 'Fat(g)']
        missing_cols = [col for col in required_cols if col not in df.columns]
        
        if missing_cols:
            print(f"Warning: Missing columns {missing_cols}. Available columns: {list(df.columns)}")
            # Try to find similar column names
            protein_col = next((col for col in df.columns if 'protein' in col.lower()), None)
            carbs_col = next((col for col in df.columns if 'carb' in col.lower()), None)
            fat_col = next((col for col in df.columns if 'fat' in col.lower()), None)
            diet_col = next((col for col in df.columns if 'diet' in col.lower()), None)
            
            if all([protein_col, carbs_col, fat_col, diet_col]):
                print(f"Using alternative column names: {diet_col}, {protein_col}, {carbs_col}, {fat_col}")
                avg_macros = df.groupby(diet_col)[[protein_col, carbs_col, fat_col]].mean()
            else:
                raise ValueError("Cannot find required nutritional columns in the dataset")
        else:
            avg_macros = df.groupby('Diet_type')[['Protein(g)', 'Carbs(g)', 'Fat(g)']].mean()
        
        print("Calculated average macronutrients per diet type:")
        print(avg_macros)
        
        # Prepare results for JSON storage
        result = {
            'processing_timestamp': datetime.now().isoformat(),
            'total_records_processed': len(df),
            'diet_types_analyzed': len(avg_macros),
            'average_macronutrients': avg_macros.reset_index().to_dict(orient='records')
        }
        
        # Create output directory if it doesn't exist
        output_dir = 'simulated_nosql'
        os.makedirs(output_dir, exist_ok=True)
        
        # Save results to simulated NoSQL storage (JSON file)
        output_file = os.path.join(output_dir, 'nutritional_analysis_results.json')
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2)
        
        print(f"Results successfully saved to: {output_file}")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Data processed and stored successfully',
                'records_processed': len(df),
                'output_file': output_file,
                'processing_time': datetime.now().isoformat()
            })
        }
        
    except Exception as e:
        print(f"Error processing data: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e),
                'message': 'Failed to process nutritional data'
            })
        }

if __name__ == "__main__":
    # Run the function when script is executed directly
    print("Starting serverless function execution...")
    result = process_nutritional_data_from_azurite()
    print("\nFunction execution completed.")
    print(f"Result: {result}")