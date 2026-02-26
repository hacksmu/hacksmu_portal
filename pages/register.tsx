import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import LoadIcon from '../components/LoadIcon';
import { useUser } from '../lib/profile/user-data';
import { RequestHelper } from '../lib/request-helper';
import { useAuthContext } from '../lib/user/AuthContext';
import firebase from 'firebase/app';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import schools from '../public/schools.json';
import majors from '../public/majors.json';
import { hackPortalConfig, formInitialValues } from '../hackportal.config';
import DisplayQuestion from '../components/registerComponents/DisplayQuestion';
import { getFileExtension } from '../lib/util';

/**
 * The registration page.
 *
 * Registration: /
 */

export default function Register() {
  const router = useRouter();

  const {
    registrationFields: {
      generalQuestions,
      schoolQuestions,
      hackathonExperienceQuestions,
      eventInfoQuestions,
      sponsorInfoQuestions,
      agreementQuestions,
    },
  } = hackPortalConfig;

  const { user, hasProfile, updateProfile } = useAuthContext();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [formValid, setFormValid] = useState(true);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  // Merge user account fields into the config-derived initial values reactively,
  // so Formik receives them even when user data loads asynchronously.
  const initialValues = React.useMemo(() => ({
    ...formInitialValues,
    id: user?.id || '',
    preferredEmail: user?.preferredEmail || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    permissions: user?.permissions || ['hacker'],
  }), [user]);

  const checkRedirect = async () => {
    if (hasProfile) router.push('/profile');
    else setLoading(false);
  };

  useEffect(() => {
    checkRedirect();
  }, [user]);

  const handleSubmit = async (registrationData) => {
    setSubmitStatus('submitting');
    try {
      if (resumeFile) {
        const formData = new FormData();
        formData.append('resume', resumeFile);
        formData.append('fileName', `${user.id}${getFileExtension(resumeFile.name)}`);
        formData.append('studyLevel', registrationData['studyLevel']);
        formData.append('major', registrationData['major']);

        await fetch('/api/resume/upload', {
          method: 'post',
          body: formData,
        });
      }
      await RequestHelper.post<Registration, any>('/api/applications', {}, registrationData);
      setSubmitStatus('success');
      updateProfile(registrationData);
      setTimeout(() => router.push('/profile'), 2500);
    } catch (error) {
      console.error(error);
      setSubmitStatus('error');
    }
  };

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files.length !== 1) return alert('Must submit one file');

    const file = e.target.files[0];

    const fileExtension = getFileExtension(file.name);

    const acceptedFileExtensions = [
      '.pdf',
      '.doc',
      '.docx',
      '.png',
      '.jpg',
      '.jpeg',
      '.txt',
      '.tex',
      '.rtf',
    ];

    if (!acceptedFileExtensions.includes(fileExtension))
      return alert(`Accepted file types: ${acceptedFileExtensions.join(' ')}`);

    setResumeFile(file);
  };

  if (!user) {
    router.push('/');
  }

  if (loading) {
    return <LoadIcon width={200} height={200} />;
  }

  //disables submitting form on enter key press
  function onKeyDown(keyEvent) {
    if ((keyEvent.charCode || keyEvent.keyCode) === 13) {
      keyEvent.preventDefault();
    }
  }

  const setErrors = (obj, values, errors) => {
    if (obj.textInputQuestions)
      for (let inputObj of obj.textInputQuestions) {
        if (inputObj.required) {
          if (!values[inputObj.name]) errors[inputObj.name] = 'Required';
        }
      }
    if (obj.numberInputQuestions)
      for (let inputObj of obj.numberInputQuestions) {
        if (inputObj.required) {
          if (!values[inputObj.name] && values[inputObj.name] !== 0)
            errors[inputObj.name] = 'Required';
        }
      }
    if (obj.dropdownQuestions)
      for (let inputObj of obj.dropdownQuestions) {
        if (inputObj.required) {
          if (!values[inputObj.name]) errors[inputObj.name] = 'Required';
        }
      }
    if (obj.checkboxQuestions)
      for (let inputObj of obj.checkboxQuestions) {
        if (inputObj.required) {
          if (!values[inputObj.name]) errors[inputObj.name] = 'Required';
        }
      }
    if (obj.datalistQuestions)
      for (let inputObj of obj.datalistQuestions) {
        if (inputObj.required) {
          if (!values[inputObj.name]) errors[inputObj.name] = 'Required';
        }
      }
    if (obj.textAreaQuestions)
      for (let inputObj of obj.textAreaQuestions) {
        if (inputObj.required) {
          if (!values[inputObj.name]) errors[inputObj.name] = 'Required';
        }
      }
      console.log(errors);
    return errors;
  };

//  return (
//    <div className="text-1xl my-4 font-bold font-small text-center">  
//      Thank you for your interest in HackSMU V! Registrations for HackSMU V are now closed. If you are an SMU student, you may show up at the door Saturday morning and be placed on a Waitlist.
//    </div>
//  )

  return (
    <div className="flex flex-col flex-grow bg-white">
      <Head>
        <title>Hacker Registration</title>
        <meta name="description" content="Register for [HACKATHON NAME]" />
        <link rel="icon" href="/icons/favicon.v3.ico" />
      </Head>

      <section id="jumbotron" className="p-2 px-6">
        <div className="max-w-4xl py-6 mx-auto flex flex-col items-center">
          <div className="registrationTitle text-4xl font-bold text-center">
            Hacker Registration
          </div>
          <div className="text-1xl my-4 font-bold font-small text-center">
            Please fill out the following fields. The application should take approximately 5
            minutes.
          </div>
        </div>
      </section>

      <section className="flex justify-center">
        <Formik
          enableReinitialize
          initialValues={initialValues}
          //validation
          //Get condition in which values.[value] is invalid and set error message in errors.[value]. Value is a value from the form(look at initialValues)
          validate={(values) => {
            var errors: any = {};
            for (let obj of generalQuestions) {
              errors = setErrors(obj, values, errors);
            }
            for (let obj of schoolQuestions) {
              errors = setErrors(obj, values, errors);
            }
            for (let obj of hackathonExperienceQuestions) {
              errors = setErrors(obj, values, errors);
            }
            for (let obj of eventInfoQuestions) {
              errors = setErrors(obj, values, errors);
            }
            for (let obj of sponsorInfoQuestions) {
              errors = setErrors(obj, values, errors);
            }

            //additional custom error validation
            if (
              values.preferredEmail &&
              !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.preferredEmail)
            ) {
              //regex matches characters before @, characters after @, and 2 or more characters after . (domain)
              errors.preferredEmail = 'Invalid email address';
            }
            if ((values.age && values.age < 1) || values.age > 100) {
              errors.age = 'Not a valid age';
            }
            if (
              (values.hackathonExperience && values.hackathonExperience < 0) ||
              values.hackathonExperience > 100
            ) {
              errors.hackathonExperience = 'Not a valid number';
            }

            return errors;
          }}
          onSubmit={async (values, { setSubmitting }) => {
            await new Promise((r) => setTimeout(r, 500));
            let finalValues: any = values;
            //add user object
            const userValues: any = {
              id: values.id,
              firstName: values.firstName,
              lastName: values.lastName,
              preferredEmail: values.preferredEmail,
              permissions: values.permissions,
            };
            finalValues['user'] = userValues;
            //delete unnecessary values
            delete finalValues.firstName;
            delete finalValues.lastName;
            delete finalValues.permissions;
            delete finalValues.preferredEmail;

            //submitting
            handleSubmit(values);
            setSubmitting(false);
            // alert(JSON.stringify(values, null, 2)); //Displays form results on submit for testing purposes
          }}
        >
          {({ values, handleChange, isValid, dirty, errors, isSubmitting }) => (
            // Field component automatically hooks input to form values. Use name attribute to match corresponding value
            // ErrorMessage component automatically displays error based on validation above. Use name attribute to match corresponding value
            <Form
              onKeyDown={onKeyDown}
              noValidate
              className="registrationForm flex flex-col max-w-4xl px-6 w-[56rem] text-lg"
            >
              <div className="text-2xl py-1 border-b-2 border-black mr-auto mt-8">General</div>
              {generalQuestions.map((obj, idx) => (
                <DisplayQuestion key={idx} obj={obj} values={values} onChange={handleChange} />
              ))}

              <div className="text-2xl py-1 border-b-2 border-black mr-auto mt-8">School Info</div>
              {schoolQuestions.map((obj, idx) => (
                <DisplayQuestion key={idx} obj={obj} values={values} onChange={handleChange} />
              ))}

              <div className="text-2xl py-1 border-b-2 border-black mr-auto mt-8">
                Hackathon Experience
              </div>
              {hackathonExperienceQuestions.map((obj, idx) => (
                <DisplayQuestion key={idx} obj={obj} values={values} onChange={handleChange} />
              ))}

              <div className="text-2xl py-1 border-b-2 border-black mr-auto mt-8">Event Info</div>
              {eventInfoQuestions.map((obj, idx) => (
                <DisplayQuestion key={idx} obj={obj} values={values} onChange={handleChange} />
              ))}

              <div className="text-2xl py-1 border-b-2 border-black mr-auto mt-8">Sponsor Info</div>
              {sponsorInfoQuestions.map((obj, idx) => (
                <DisplayQuestion key={idx} obj={obj} values={values} onChange={handleChange} />
              ))}

              {agreementQuestions.map((obj, idx) => (
                <DisplayQuestion key={idx} obj={obj} values={values} onChange={handleChange} />
              ))}

              {/* Resume Upload */}
              <label className="mt-4">
                Upload your resume:
                <br />
                <input
                  onChange={(e) => handleResumeFileChange(e)}
                  name="resume"
                  type="file"
                  formEncType="multipart/form-data"
                  accept=".pdf, .doc, .docx, image/png, image/jpeg, .txt, .tex, .rtf"
                />
                <br />
              </label>

              {/* Submit */}
              <div className="my-8">
                <button
                  type="submit"
                  disabled={isSubmitting || submitStatus === 'submitting'}
                  className="mr-auto cursor-pointer px-4 py-2 rounded-md bg-blue-200 hover:bg-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setFormValid(!(!isValid || !dirty))}
                >
                  {isSubmitting || submitStatus === 'submitting' ? 'Submitting…' : 'Submit'}
                </button>

                {/* Validation errors */}
                {!isValid && !formValid && (
                  <div className="text-red-600 mt-3">
                    <div className="font-bold mb-1">Please fix the following fields:</div>
                    <ul className="list-disc list-inside text-sm space-y-0.5">
                      {Object.entries(errors).map(([field, msg]) => (
                        <li key={field}>
                          <span className="font-semibold">
                            {field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                          </span>
                          {': '}
                          {msg as string}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Submission status banner */}
                {submitStatus === 'success' && (
                  <div className="mt-4 flex items-center gap-3 rounded-lg border border-green-400 bg-green-50 px-4 py-3 text-green-800">
                    <svg className="h-5 w-5 shrink-0 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <div className="font-semibold">Registration saved!</div>
                      <div className="text-sm">Your application was successfully submitted to Firebase. Redirecting to your profile…</div>
                    </div>
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div className="mt-4 flex items-center gap-3 rounded-lg border border-red-400 bg-red-50 px-4 py-3 text-red-800">
                    <svg className="h-5 w-5 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <div className="font-semibold">Submission failed</div>
                      <div className="text-sm">Could not save to Firebase. Please try again or contact an organizer.</div>
                    </div>
                  </div>
                )}
              </div>
            </Form>
          )}
        </Formik>
      </section>
    </div>
  );
}
