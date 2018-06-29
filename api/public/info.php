<?php
    session_start();
    header('Access-Control-Allow-Origin: http://gabeowens.com');
    // header('Access-Control-Allow-Origin: http://portfolio.test');
    header('Access-Control-Allow-Credentials: true');
    header('Content-Type: application/json');
    header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Authorization, WWW-Authenticate, Origin, X-Requested-With, Content-Type, Accept');
    

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $response = [
            'result' => False,
            'message' => 'Unauthorized'
        ];
        if(isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === True){
            $response['message'] = 'authenticated';
            if(isset($_SESSION['expiration']) && is_string($_SESSION['expiration'])){
                $response['message'] = 'expiration';
                $expiration = new DateTime($_SESSION['expiration']);
                $now = new DateTime();
                if ($now <= $expiration){
                    $expiration = new DateTime();
                    $expiration->add(new DateInterval('PT30M'));
                    $_SESSION['expiration'] = $expiration->format('Y-m-d H:i:s');

                    $response = [
                        'result' => True,
                        'contact' => [
                            'email' => 'GabeVOwens@gmail.com',
                            'phone' => '(217)691-8664',
                            'website' => 'http://gabeowens.com',
                            'linkedIn' => 'https://www.linkedin.com/in/gabeowens'
                        ],
                        'references' => [
                            [
                                'name' => 'William Martin',
                                'job' => 'CEO of Ulytic Inc',
                                'phone' => '(660)631-4680'
                            ],
                            [
                                'name' => 'Gerogi Angelov',
                                'job' => 'Software Engineer',
                                'phone' => '(773)751-9932'
                            ],
                            [
                                'name' => 'Michael Crawford',
                                'job' => 'Software Engineer',
                                'phone' => '(573)979-4671'
                            ],
                            [
                                'name' => 'Spencer Rennier',
                                'job' => 'Financial Advisor',
                                'phone' => '(573)424-9632'
                            ],
                        ],
                        'aboutMe' => [
                            'intro' => 'My name is Gabe Owens and I am a Full-Stack Developer. Born and raised in central Illinois, I moved to Columbia, Missouri after high school to attend the University of Missouri (MU), where I would graduate with my Bachelor of Science in Information Technology.',
                            'intern_1' => 'After working part-time as Support Specialist for the Division of IT at MU, I was accepted into the summer 2013 intern program at Veterans United Home Loans (VU) as a full-time Web Applications Developer. At the end of the summer, I was one of two candidates offered continuing part-time internships, which would lead to a job offer after graduation in December of 2013.',
                            'work_1' => 'Upon graduating from the University of Missouri, I accepted a full-time position at VU as a Software Engineer. Working at VU was a great learning experience, as well as an amazing work environment. During my first year of full-time employment, VU made the decision to transition from a "PHP Shop" to a ".NET Shop". This included extensive training in C#/.Net development in order to build, deploy, and maintain large business-centric applications. I also had the opportunity to continue my education by attending conferences such as the HTML5 Developer Conference in San Francisco and the Days of .NET conference in St. Louis. In June of 2014, I was awarded VU\'s Master of IT award (pictured left).',
                            'work_2' => 'In May of 2016, I left VU to work full-time as Chief Information Officer at Ulytic Inc, a company which I co-founded. Being the only full-time engineer, I was responsible for overseeing the entirety of the business\' software development and IT infrastructure. This allowed me to grow my knowledge in all aspects of development, from domain routing and load balanacing cloud server clusters to database design and large data storage. Since Ulytic\'s primary function was to analyze video with computer vision, I was able to develop my skills in AI and Neural Networks, as well as design custom object tracking algorithms. In the fall of 2017, I led the design and development of a distributable software package that would be licensed to Panasonic as an add-on system to track parking lot vehicles.',
                            'wrap_up' => 'Based on these varied experiences, I\'m confident that I could work on a wide range of projects and be an asset to any development team.'
                        ],
                        'projects' => [
                            [
                                'id' => 1,
                                'title' => 'Portfolio Website',
                                'description' => 'More details about the website you are on right now.'
                            ],
                            [
                                'id' => 3,
                                'title' => 'Image Annotator',
                                'description' => 'A Python program I wrote to create training data for neural networks.'
                            ],
                            [
                                'id' => 2,
                                'title' => 'Computer Vision Demo',
                                'description' => 'Demonstration of a Neural Network I trained running alongside a custom tracking algorithm.'
                            ],
                        ]
                    ];
                }
            }
        }
        echo json_encode($response);
    }

?>