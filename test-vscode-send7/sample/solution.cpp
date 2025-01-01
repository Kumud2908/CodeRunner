
#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    int BinarySearch(int low,vector<pair<int,int>>& vec,int key){
        int high=vec.size()-1;
        cout<<key<<endl;
        while(low<=high){
            cout<<low<<" "<<high<<endl;
            int mid=(low+high)/2;
            if(vec[mid].first==key){
                cout<<vec[mid].first<<" fnd "<<key<<endl;
                return mid;
            }else if(vec[mid].first<key){
                low=mid+1;
            }else{
                high=mid-1;
            }
        }
        return -1;

    }
    vector<int> twoSum(vector<int>& nums, int target) {
        vector<pair<int,int>> vec;
        for(int i=0;i<nums.size();i++){
            vec.push_back({nums[i],i});
        }

        vector<int> ans;
        int n=nums.size();
        sort(vec.begin(),vec.end());
        int i{0},j{n-1};
        while(i<j){
            if(vec[i].first+vec[j].first==target){
                ans.push_back(vec[j].second);
                ans.push_back(vec[i].second);
                return ans;
            }else if(vec[i].first+vec[j].first<target){
                i++;
            }else{
                j--;
            }

        }
        
        return ans;

        
    }
};

int main()
{
    int t;
    cin >> t;
    cin.ignore(); // Clear the newline character left in the input buffer

    Solution solution;

    for (int i = 0; i < t; i++)
    {
        string input;
        vector<int> vec;

        // Read the line containing the array
        getline(cin, input);

        // Parse the line into integers
        stringstream ss(input);
        int num;
        while (ss >> num) {
            vec.push_back(num);
        }

        // // Read the target value
        int target;
        cin >> target;
        cin.ignore(); // Clear the newline character left in the buffer

        // Solve the problem
        vec = solution.twoSum(vec,target);

        // Print the result
        for (int j = 0; j < vec.size(); j++) {
            cout << vec[j] << " ";
        }
        
    }

    return 0;
}