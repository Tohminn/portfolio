<?php

class ProjectController {
    protected $projectId;

    public function __construct($projectId){
        $this->projectId = $projectId;
    }

    public function buildProjectObject(){
        $project = false;
        if ($this->isValidProjectId()){
            $project = $this->getBasicProjectDetails();
            $project = $this->addAboutPage($project);
        }
        return $project;
    }

    protected function isValidProjectId(){
        switch ($this->projectId) {
            case '1':
                return True;
                break;
            case '2':
                return True;
                break;
            case '3':
                return True;
                break;
            case '4':
                return True;
                break;
        }
        return False;
    }

    protected function getBasicProjectDetails(){
        switch ($this->projectId) {
            case '1':
                return [
                    'id' => 1,
                    'title' => 'Portfolio Website',
                    'about' => '',
                    'download' => True,
                    'video' => False,
                    'links' => [
                        [
                            'name' => 'portfolioWebsite.zip',
                            'file' => 'portfolioWebsite.zip'
                        ],
                    ]
                ];
                break;
            case '2':
                return [
                    'id' => 2,
                    'title' => 'Computer Vision Demo',
                    'about' => '',
                    'download' => False,
                    'video' => True,
                    'links' => [
                        [
                            'name' => 'Entrance 1',
                            'src' => '/media/Entrance_1.mov'
                        ],
                        [
                            'name' => 'Entrance 2',
                            'src' => '/media/Entrance_2.mov'
                        ],
                    ]
                ];
                break;
            case '3':
                return [
                    'id' => 3,
                    'title' => 'Image Annotator',
                    'about' => '',
                    'download' => True,
                    'video' => False,
                    'links' => []
                ];
                break;
            case '4':
                return [
                    'id' => 4,
                    'title' => 'Wedding Website',
                    'about' => '',
                    'download' => True,
                    'video' => False,
                    'links' => []
                ];
                break;
        }
    }

    protected function addAboutPage($project){
        switch ($this->projectId) {
            case '1':
                $project['about'] = file_get_contents('../templates/portfolioWebsite.html');
                break;
            case '2':
                $project['about'] = file_get_contents('../templates/computerVisionDemo.html');
                break;
            case '3':
                $project['about'] = file_get_contents('../templates/imageAnnotator.html');
                break;
            case '4':
                $project['about'] = file_get_contents('../templates/weddingWebsite.html');
                break;
        }
        return $project;
    }
}
?>