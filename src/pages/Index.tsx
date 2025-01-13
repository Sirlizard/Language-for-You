import { Header } from "@/components/Header";
import { ChatBox } from "@/components/ChatBox";
import { Button } from "@/components/ui/button";
import { User, Upload, Briefcase, Clock, History, Crown } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center mb-8 space-y-4">
          <h1 className="text-4xl font-bold font-cambria">
            Hello and welcome to Language for You
          </h1>
          <p className="text-lg text-muted-foreground">
            Utilize the chat for any questions that you might have about localizing.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8 mb-12">
          <div className="space-y-2">
            <p className="text-lg">
              You can create a profile in the profile selection. Along with this you can add a profile picture, 
              view your rating, create a username, and add languages that you are familiar with to localize media
            </p>
            <Link to="/profile">
              <Button className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Go to Profile
              </Button>
            </Link>
          </div>

          <div className="space-y-2">
            <p className="text-lg">
              If you wish to submit a job you can utilize the Submit Jobs page. You can specify the language, 
              leave a note, and submit a file. This file will appear in the View Jobs page for localizers 
              that have the specified language as part of their profile.
            </p>
            <Link to="/submit-job">
              <Button className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Submit a Job
              </Button>
            </Link>
          </div>

          <div className="space-y-2">
            <p className="text-lg">
              If you wish to obtain a localizing job you can go to the view jobs page to view all available 
              jobs that align with your language that you selected on your profile. Once accepted the job 
              would be placed in the working jobs page.
            </p>
            <Link to="/view-jobs">
              <Button className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                View Jobs
              </Button>
            </Link>
          </div>

          <div className="space-y-2">
            <p className="text-lg">
              In the working job page you can see all the accepted jobs you have accepted and download their files. 
              Once you complete the localization you can return the file with a return file submission.
            </p>
            <Link to="/working-jobs">
              <Button className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Working Jobs
              </Button>
            </Link>
          </div>

          <div className="space-y-2">
            <p className="text-lg">
              Once a localizer returns a file you can view the return submission in the history page. 
              As well you can give a rating to the user for the localization.
            </p>
            <Link to="/history">
              <Button className="flex items-center gap-2">
                <History className="h-4 w-4" />
                History
              </Button>
            </Link>
          </div>

          <div className="space-y-2">
            <p className="text-lg">
              If you are a premium user you get exclusive access to AI tools like AI translation 
              and AI voice over in the Premium page
            </p>
            <Link to="/premium-translation">
              <Button className="flex items-center gap-2">
                <Crown className="h-4 w-4" />
                Premium Features
              </Button>
            </Link>
          </div>
        </div>

        <ChatBox />
      </main>
    </div>
  );
};

export default Index;