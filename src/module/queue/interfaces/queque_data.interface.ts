export class QueueData {
    constructor(
        public script: string,  // The name of the script to be executed
        public param: Param,    // Parameters to be passed to the script
        public callbackFunc: (value: any) => any, // Function to be executed after the script finishes
        public bot: any,        // Telegram bot
        public data: any        // Additional data
    ) {}
}

type Param = {
    public: string[],
    private: string[]
}