/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from 'react';
import 'firebase/storage';
import firebase from 'firebase';

/**
 * Keynote Speaker card for landing page.
 */
export default function KeynoteSpeaker(props) {
  const [imageLink, setImageLink] = useState();

  useEffect(() => {
    if (props.imageLink !== undefined) {
      const storageRef = firebase.storage().ref();
      storageRef
        .child(`speaker_images/${props.imageLink}`)
        .getDownloadURL()
        .then((url) => {
          setImageLink(url);
        })
        .catch((error) => {
          console.error('Could not find matching image file');
        });
    }
  }, []);

  return (
    <div className="flex w-[28rem] h-[9rem] md:mr-20 mr-16 my-4">
      <div
        style={{ backgroundColor: props.cardColor.light, overflow: 'hidden' }}
        className="w-1/4 rounded-l-md"
      >
        {props.imageLink !== undefined && imageLink !== undefined && (
          <img
            src={imageLink}
            alt=""
            style={{ width: 112, height: 144, objectFit: 'cover' }}
          />
        )}
      </div>
      <div style={{ backgroundColor: props.cardColor.dark }} className="w-3/4 p-2 rounded-r-md">
        <h1 className="text-lg font-bold"> {props.name}</h1>
        <div className="text-xs">{props.description}</div>
      </div>
    </div>
  );
}
