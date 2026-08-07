UPDATE gallery_avatars
SET image_url = REPLACE(
        image_url,
        'http://localhost:9000/venyx-images/',
        'https://nyvorai-media-prod.s3.sa-east-1.amazonaws.com/'
                )
WHERE image_url LIKE 'http://localhost:9000/venyx-images/%';